const pmin = 40000;
const pmax = 100000000;
const smax = 10000000000000000;

export function getPrice(s0: number): number {
    return pmin + (pmax - pmin) * (s0 / smax);
}