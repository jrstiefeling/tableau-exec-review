#!/usr/bin/env python3
"""Verify the MOTION-grain claim against the product-grain one.

Companion to verify-claim.py. Same inputs, same method, one question added:
if the tab is going to argue "motion sets the level", does motion survive the
dollar test the way product did?

Reads ONLY data/board.json. Every input is authored; every output is derived.
Inputs used:
  seg-spread.metrics.rows[].parts[].priorValue   (authored, $M)
  seg-spread.metrics.rows[].parts[].delta        (authored, $M)
"""
import json, itertools

B = json.load(open('data/board.json'))
TAB = [t for t in B['tabs'] if t['id'] == 'performance-by-segment'][0]
P = {p['id']: p for b in TAB['bands'] for p in b['portlets']}
mv = P['seg-spread']['metrics']

SEGS = [r['label'] for r in mv['rows']]
PRODS = [p['short'] for p in mv['rows'][0]['parts']]

prior, move = {}, {}
for r in mv['rows']:
    for pt in r['parts']:
        prior[(pt['short'], r['label'])] = pt['priorValue']
        move[(pt['short'], r['label'])] = pt['delta']

cells = list(itertools.product(PRODS, SEGS))
TP, TM = sum(prior.values()), sum(move.values())
G = TM / TP
gross = sum(abs(move[c]) for c in cells)

MOTION = {'Cloud': 'Platform', 'Server': 'Platform',
          'Next': 'Embedded', 'CRMA': 'Embedded'}


def grouped(keyfn):
    """Prior-dollar-weighted rate for each group under some partition."""
    out = {}
    for c in cells:
        out.setdefault(keyfn(c), [0.0, 0.0])
        out[keyfn(c)][0] += prior[c]
        out[keyfn(c)][1] += move[c]
    return {k: dict(prior=p, move=m, rate=m / p) for k, (p, m) in out.items()}


def err(keyfn):
    """Total absolute dollar error from predicting each cell at its group rate."""
    g = grouped(keyfn)
    return sum(abs(move[c] - prior[c] * g[keyfn(c)]['rate']) for c in cells)


def eta(keyfn):
    """Prior-dollar-weighted one-way eta^2 on the cell growth rate."""
    rate = {c: move[c] / prior[c] for c in cells}
    V = sum(prior[c] * (rate[c] - G) ** 2 for c in cells) / TP
    g = grouped(keyfn)
    Vg = sum(v['prior'] * (v['rate'] - G) ** 2 for v in g.values()) / TP
    return Vg / V


PARTITIONS = {
    'nothing':           lambda c: 'all',
    'segment (4)':       lambda c: c[1],
    'motion (2)':        lambda c: MOTION[c[0]],
    'product line (4)':  lambda c: c[0],
    'motion x seg (8)':  lambda c: (MOTION[c[0]], c[1]),
}

e0 = err(PARTITIONS['nothing'])

print("=" * 78)
print("MOTION vs PRODUCT — dollar counterfactual on ACV_clc, 16 leaf cells")
print("=" * 78)
print(f"gross movement to explain        ${gross:.2f}M")
print(f"overall rate                     {G*100:+.1f}%   (prior ${TP:.2f}M -> ${TP+TM:.2f}M)\n")
print(f"{'know':<20}{'unexplained $':>15}{'removes':>12}{'share':>9}{'eta^2':>9}")
for name, fn in PARTITIONS.items():
    e = err(fn)
    ee = '  —  ' if name == 'nothing' else f"{eta(fn)*100:6.1f}%"
    print(f"{name:<20}{e:>14.2f}M{e0-e:>11.2f}M{(e0-e)/e0*100:>8.0f}%{ee:>9}")

print("\n" + "=" * 78)
print("WHY — the two motions, and whether each is internally coherent")
print("=" * 78)
mg = grouped(lambda c: MOTION[c[0]])
pg = grouped(lambda c: c[0])
for m in ('Platform', 'Embedded'):
    members = [p for p in PRODS if MOTION[p] == m]
    rs = [pg[p]['rate'] * 100 for p in members]
    print(f"  {m:9} ${mg[m]['prior']:7.2f}M prior -> {mg[m]['rate']*100:+8.1f}%   members: "
          + ", ".join(f"{p} {pg[p]['rate']*100:+.1f}%" for p in members))
    print(f"  {'':9} internal spread between members: {max(rs)-min(rs):.1f} pts")

print("\n" + "=" * 78)
print("THE PLATFORM BOOK ALONE — where the ACV shortfall sits")
print("=" * 78)
plat = [c for c in cells if MOTION[c[0]] == 'Platform']
pp = sum(prior[c] for c in plat)
pm = sum(move[c] for c in plat)
pG = pm / pp


def perr(keyfn):
    out = {}
    for c in plat:
        out.setdefault(keyfn(c), [0.0, 0.0])
        out[keyfn(c)][0] += prior[c]
        out[keyfn(c)][1] += move[c]
    g = {k: m / p for k, (p, m) in out.items()}
    return sum(abs(move[c] - prior[c] * g[keyfn(c)]) for c in plat)


pe0 = perr(lambda c: 'all')
print(f"  prior ${pp:.2f}M, movement {pm:+.2f}M, rate {pG*100:+.1f}%")
print(f"  know nothing        ${pe0:.2f}M unexplained")
print(f"  know the product    ${perr(lambda c: c[0]):.2f}M   removes ${pe0-perr(lambda c: c[0]):.2f}M")
print(f"  know the segment    ${perr(lambda c: c[1]):.2f}M   removes ${pe0-perr(lambda c: c[1]):.2f}M")
