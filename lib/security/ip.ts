import { BlockList, isIP } from "node:net";

/**
 * Faixas que nunca devem ser acessadas a partir do servidor: rede privada,
 * loopback, link-local (inclui metadados de cloud 169.254.169.254), CGNAT,
 * multicast, reservadas e de documentação.
 */
const blocked = new BlockList();

const IPV4_RANGES: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const IPV6_RANGES: Array<[string, number]> = [
  ["::", 128],
  ["::1", 128],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
];

for (const [net, prefix] of IPV4_RANGES) blocked.addSubnet(net, prefix, "ipv4");
for (const [net, prefix] of IPV6_RANGES) blocked.addSubnet(net, prefix, "ipv6");

/** Expande um IPv6 (com "::" e/ou IPv4 embutido) para 8 grupos de 16 bits. */
function ipv6Groups(address: string): number[] | null {
  let addr = address.toLowerCase().split("%")[0];
  const v4 = addr.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const parts = v4[1].split(".").map(Number);
    if (parts.some((p) => p > 255)) return null;
    addr =
      addr.slice(0, -v4[1].length) +
      ((parts[0] << 8) | parts[1]).toString(16) +
      ":" +
      ((parts[2] << 8) | parts[3]).toString(16);
  }
  const [head, tail] = addr.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail !== undefined && tail ? tail.split(":") : [];
  const missing = 8 - headParts.length - tailParts.length;
  if (addr.includes("::") ? missing < 1 : missing !== 0) return null;
  const all = [...headParts, ...Array(addr.includes("::") ? missing : 0).fill("0"), ...tailParts];
  const groups = all.map((g) => parseInt(g, 16));
  return groups.length === 8 && groups.every((g) => g >= 0 && g <= 0xffff) ? groups : null;
}

function v4FromGroups(hi: number, lo: number) {
  return `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;
}

/** IPv4 escondido dentro de um IPv6 (mapeado, compatível, NAT64 ou 6to4). */
function embeddedIpv4(address: string): string | null {
  const g = ipv6Groups(address);
  if (!g) return null;
  const zeros = (from: number, to: number) => g.slice(from, to).every((x) => x === 0);
  if (zeros(0, 5) && g[5] === 0xffff) return v4FromGroups(g[6], g[7]); // ::ffff:a.b.c.d
  if (zeros(0, 6)) return v4FromGroups(g[6], g[7]); // ::a.b.c.d
  if (g[0] === 0x64 && g[1] === 0xff9b && zeros(2, 6)) return v4FromGroups(g[6], g[7]); // 64:ff9b::/96
  if (g[0] === 0x2002) return v4FromGroups(g[1], g[2]); // 6to4
  return null;
}

/** true se o IP for público e roteável na internet. IPs inválidos retornam false. */
export function isPublicIp(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  if (family === 6) {
    const v4 = embeddedIpv4(address);
    if (v4 && !isPublicIp(v4)) return false;
    return !blocked.check(address, "ipv6");
  }
  return false;
}
