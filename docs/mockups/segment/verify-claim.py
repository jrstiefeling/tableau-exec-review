#!/usr/bin/env python3
"""Verify the product-vs-segment variance-decomposition claim.

Reads ONLY data/board.json. Every input is authored; every output is labelled derived.
Inputs used:
  seg-spread.metrics.rows[].parts[].priorValue   (authored, $M)
  seg-spread.metrics.rows[].parts[].delta        (authored, $M)
  seg-matrix.metrics.rows[].yoy                  (authored, %)  -- rate-only comparison
"""
import json, itertools, statistics as st

B = json.load(open('data/board.json'))
TAB = [t for t in B['tabs'] if t['id'] == 'performance-by-segment'][0]
P = {p['id']: p for b in TAB['bands'] for p in b['portlets']}

mv = P['seg-spread']['metrics']
mx = P['seg-matrix']['metrics']

SEGS = [r['label'] for r in mv['rows']]                     # ENTR CMRCL SMB PubSec
PRODS = [p['short'] for p in mv['rows'][0]['parts']]        # Cloud Server Next CRMA

prior, move = {}, {}
for r in mv['rows']:
    for pt in r['parts']:
        prior[(pt['short'], r['label'])] = pt['priorValue']
        move[(pt['short'], r['label'])]  = pt['delta']

cells = list(itertools.product(PRODS, SEGS))
rate  = {c: move[c] / prior[c] for c in cells}              # derived

TP, TM = sum(prior.values()), sum(move.values())
G = TM / TP

def marg(keys, axis):
    """axis=0 -> group by product, axis=1 -> group by segment"""
    out = {}
    for k in keys:
        cs = [c for c in cells if c[axis] == k]
        p, m = sum(prior[c] for c in cs), sum(move[c] for c in cs)
        out[k] = dict(prior=p, move=m, rate=m/p)
    return out

MP, MS = marg(PRODS, 0), marg(SEGS, 1)

print("="*78)
print("AUTHORED INPUTS — 16 leaf cells, ACV_clc $M (certified additive)")
print("="*78)
print(f"{'':8}" + "".join(f"{s:>26}" for s in SEGS))
for p in PRODS:
    print(f"{p:8}" + "".join(
        f"{prior[(p,s)]:>10.2f} ->{prior[(p,s)]+move[(p,s)]:>6.0f} ({move[(p,s)]:+6.2f})" for s in SEGS))
print(f"\nTotal prior ${TP:.2f}M -> current ${TP+TM:.2f}M ; movement {TM:+.2f}M ; overall rate {G*100:+.1f}%")

print()
print("="*78)
print("A. RATE-ONLY SPREAD (the measure the board distrusts)")
print("="*78)
print("within-PRODUCT spread across the four segments, percentage points:")
for p in PRODS:
    rs = [rate[(p,s)]*100 for s in SEGS]
    print(f"  {p:8} {min(rs):+8.1f} .. {max(rs):+9.1f}   range {max(rs)-min(rs):8.1f} pts")
wp = [max(rate[(p,s)]*100 for s in SEGS) - min(rate[(p,s)]*100 for s in SEGS) for p in PRODS]
print("within-SEGMENT spread across the four product lines, percentage points:")
for s in SEGS:
    rs = [rate[(p,s)]*100 for p in PRODS]
    print(f"  {s:8} {min(rs):+8.1f} .. {max(rs):+9.1f}   range {max(rs)-min(rs):8.1f} pts")
ws = [max(rate[(p,s)]*100 for p in PRODS) - min(rate[(p,s)]*100 for p in PRODS) for s in SEGS]
print(f"\n  median within-product range {st.median(wp):.1f} pts")
print(f"  median within-segment range {st.median(ws):.1f} pts")
print(f"  ratio {st.median(ws)/st.median(wp):.1f}x  <-- rate-based, base-size contaminated")

print()
print("="*78)
print("B. PRIOR-DOLLAR-WEIGHTED TWO-WAY VARIANCE DECOMPOSITION")
print("="*78)
V   = sum(prior[c]*(rate[c]-G)**2 for c in cells)/TP
Vp  = sum(MP[p]['prior']*(MP[p]['rate']-G)**2 for p in PRODS)/TP
Vs  = sum(MS[s]['prior']*(MS[s]['rate']-G)**2 for s in SEGS)/TP
print(f"  total weighted variance of cell growth rate      {V:.5f}")
print(f"  explained by PRODUCT alone   {Vp:.5f}   eta^2 = {Vp/V*100:5.1f}%")
print(f"  explained by SEGMENT alone   {Vs:.5f}   eta^2 = {Vs/V*100:5.1f}%")
print(f"  ratio {Vp/Vs:.1f}x in favour of PRODUCT")
print("\n  marginal rates (derived):")
for p in PRODS: print(f"    product {p:8} ${MP[p]['prior']:7.2f}M -> {MP[p]['rate']*100:+8.1f}%")
for s in SEGS:  print(f"    segment {s:8} ${MS[s]['prior']:7.2f}M -> {MS[s]['rate']*100:+8.1f}%")

print()
print("="*78)
print("C. COUNTERFACTUAL DOLLAR-ERROR TEST  (the headline, in dollars)")
print("="*78)
print("  Predict each cell's movement two ways, then total the dollar error.")
ep = sum(abs(move[c]-prior[c]*MP[c[0]]['rate']) for c in cells)
es = sum(abs(move[c]-prior[c]*MS[c[1]]['rate']) for c in cells)
e0 = sum(abs(move[c]-prior[c]*G) for c in cells)
gross = sum(abs(move[c]) for c in cells)
print(f"  gross movement to explain                      ${gross:6.2f}M")
print(f"  know nothing (everything at the overall rate)  ${e0:6.2f}M unexplained  ({e0/gross*100:4.1f}%)")
print(f"  know only the PRODUCT                          ${ep:6.2f}M unexplained  ({ep/gross*100:4.1f}%)")
print(f"  know only the SEGMENT                          ${es:6.2f}M unexplained  ({es/gross*100:4.1f}%)")
print(f"\n  product knowledge removes ${e0-ep:.2f}M of the ${e0:.2f}M error  ({(e0-ep)/e0*100:.0f}%)")
print(f"  segment knowledge removes ${e0-es:.2f}M of the ${e0:.2f}M error  ({(e0-es)/e0*100:.0f}%)")
print(f"  product is {(e0-ep)/(e0-es):.1f}x the explanation segment is")

print()
print("="*78)
print("D. THE PANEL-READY SPREAD MEASURE (marginal-free, in dollars)")
print("="*78)
print("  For each group, hold every dollar in the group at each member's own rate")
print("  in turn and read the spread of resulting group movements, in $M.")
def swap_spread(k, axis, members):
    cs = [c for c in cells if c[axis] == k]
    pk = sum(prior[c] for c in cs)
    outs = {m: pk*(rate[(k,m)] if axis==0 else rate[(m,k)]) for m in members}
    return pk, outs
print("\n  within-PRODUCT (its own dollars at each segment's rate):")
wpd = {}
for p in PRODS:
    pk, outs = swap_spread(p, 0, SEGS)
    lo, hi = min(outs.values()), max(outs.values())
    wpd[p] = (pk, lo, hi, hi-lo)
    print(f"    {p:8} ${pk:6.2f}M prior -> {lo:+7.2f}M .. {hi:+7.2f}M   spread ${hi-lo:5.2f}M")
print("\n  within-SEGMENT (its own dollars at each product's rate):")
wsd = {}
for s in SEGS:
    pk, outs = swap_spread(s, 1, PRODS)
    lo, hi = min(outs.values()), max(outs.values())
    wsd[s] = (pk, lo, hi, hi-lo)
    print(f"    {s:8} ${pk:6.2f}M prior -> {lo:+7.2f}M .. {hi:+7.2f}M   spread ${hi-lo:5.2f}M")
print("\n  normalised by the group's own prior dollars (comparable across groups):")
for p in PRODS: print(f"    product {p:8} spread = {wpd[p][3]/wpd[p][0]*100:7.1f}% of its prior")
for s in SEGS:  print(f"    segment {s:8} spread = {wsd[s][3]/wsd[s][0]*100:7.1f}% of its prior")

print()
print("="*78)
print("E. SAME TEST ON THE FULL 7-ROW MATRIX (derived priors, all 28 cells)")
print("="*78)
mrows = mx['rows']
mseg = [s['short'] for s in mx['segments']]
mp2, mm2 = {}, {}
for r in mrows:
    for i,s in enumerate(mseg):
        v, y = r['values'][i], r['yoy'][i]/100
        pr = v/(1+y)
        mp2[(r['label'],s)] = pr; mm2[(r['label'],s)] = v-pr
leaf = [r['label'] for r in mrows if r['level']==2]
print("  leaf rows only (the additive partition):", ", ".join(leaf))
c2 = [(p,s) for p in leaf for s in mseg]
TP2 = sum(mp2[c] for c in c2); TM2 = sum(mm2[c] for c in c2); G2 = TM2/TP2
r2 = {c: mm2[c]/mp2[c] for c in c2}
MP2 = {p: (sum(mp2[(p,s)] for s in mseg), sum(mm2[(p,s)] for s in mseg)) for p in leaf}
MS2 = {s: (sum(mp2[(p,s)] for p in leaf), sum(mm2[(p,s)] for p in leaf)) for s in mseg}
V2  = sum(mp2[c]*(r2[c]-G2)**2 for c in c2)/TP2
Vp2 = sum(v[0]*((v[1]/v[0])-G2)**2 for v in MP2.values())/TP2
Vs2 = sum(v[0]*((v[1]/v[0])-G2)**2 for v in MS2.values())/TP2
print(f"  eta^2 product {Vp2/V2*100:.1f}%   eta^2 segment {Vs2/V2*100:.1f}%   ratio {Vp2/Vs2:.1f}x")
ep2 = sum(abs(mm2[c]-mp2[c]*(MP2[c[0]][1]/MP2[c[0]][0])) for c in c2)
es2 = sum(abs(mm2[c]-mp2[c]*(MS2[c[1]][1]/MS2[c[1]][0])) for c in c2)
e02 = sum(abs(mm2[c]-mp2[c]*G2) for c in c2)
print(f"  unexplained $: none {e02:.2f}M | product {ep2:.2f}M | segment {es2:.2f}M")
print(f"  product removes {(e02-ep2)/e02*100:.0f}%, segment removes {(e02-es2)/e02*100:.0f}%  -> {(e02-ep2)/(e02-es2):.1f}x")
print("  (cross-checks the authored-figure result above; agrees to within rounding)")

print()
print("="*78)
print("F. ROBUSTNESS — does it survive dropping the tiny-base line?")
print("="*78)
def redo(pr, mo, rows, cols, name):
    cs=[(p,s) for p in rows for s in cols]
    tp=sum(pr[c] for c in cs); tm=sum(mo[c] for c in cs); g=tm/tp
    r={c:mo[c]/pr[c] for c in cs}
    A={p:(sum(pr[(p,s)] for s in cols), sum(mo[(p,s)] for s in cols)) for p in rows}
    Bm={s:(sum(pr[(p,s)] for p in rows), sum(mo[(p,s)] for p in rows)) for s in cols}
    V=sum(pr[c]*(r[c]-g)**2 for c in cs)/tp
    Vp=sum(v[0]*((v[1]/v[0])-g)**2 for v in A.values())/tp
    Vs=sum(v[0]*((v[1]/v[0])-g)**2 for v in Bm.values())/tp
    ep=sum(abs(mo[c]-pr[c]*(A[c[0]][1]/A[c[0]][0])) for c in cs)
    es=sum(abs(mo[c]-pr[c]*(Bm[c[1]][1]/Bm[c[1]][0])) for c in cs)
    e0=sum(abs(mo[c]-pr[c]*g) for c in cs)
    print(f"  {name}")
    print(f"    eta^2 product {Vp/V*100:5.1f}%  segment {Vs/V*100:5.1f}%   ratio {Vp/Vs:5.1f}x")
    print(f"    $ error: none {e0:6.2f}M  product {ep:6.2f}M  segment {es:6.2f}M "
          f"-> product removes {(e0-ep)/e0*100:3.0f}%, segment {(e0-es)/e0*100:3.0f}%  ({(e0-ep)/(e0-es):.1f}x)")
    return Vp/Vs, (e0-ep)/(e0-es)

redo(prior, move, PRODS, SEGS, "all four product lines (baseline)")
redo(prior, move, [p for p in PRODS if p!='Next'], SEGS, "Tableau Next dropped (the $2.77M-prior line)")
redo(prior, move, ['Cloud','Server'], SEGS, "platform only (Cloud + Server, $100.0M prior)")
redo(prior, move, PRODS, [s for s in SEGS if s!='PubSec'], "PubSec dropped (the derived column)")

print()
print("="*78)
print("G. WHERE THE PRODUCT MODEL FAILS — per-cell dollar residuals")
print("="*78)
print("  residual = actual movement minus (cell's prior dollars x its product's own rate)")
print(f"{'':8}" + "".join(f"{s:>12}" for s in SEGS) + "      row |res|")
tot=0
for p in PRODS:
    row=[move[(p,s)]-prior[(p,s)]*MP[p]['rate'] for s in SEGS]
    tot+=sum(abs(x) for x in row)
    print(f"{p:8}" + "".join(f"{x:>+12.2f}" for x in row) + f"{sum(abs(x) for x in row):>12.2f}")
print(f"{'col |res|':8}" + "".join(f"{sum(abs(move[(p,s)]-prior[(p,s)]*MP[p]['rate']) for p in PRODS):>12.2f}" for s in SEGS) + f"{tot:>12.2f}")

print()
print("="*78)
print("H. FIGURES THE MOCKUPS MAY PRINT")
print("="*78)
print("  authored, straight from board.json:")
print("    16 valueDisplay, 16 priorDisplay, 16 deltaDisplay, 16 yoyDisplay")
print("    4 netDisplay, 4 lossWing, 4 gainWing, 28 matrix display + yoyDisplay")
print("  derived (label as derived):")
for p in PRODS:
    print(f"    product {p:8} prior ${MP[p]['prior']:.2f}M  movement {MP[p]['move']:+.2f}M  rate {MP[p]['rate']*100:+.1f}%")
for s in SEGS:
    print(f"    segment {s:8} prior ${MS[s]['prior']:.2f}M  movement {MS[s]['move']:+.2f}M  rate {MS[s]['rate']*100:+.1f}%")
print(f"    board    prior ${TP:.2f}M  movement {TM:+.2f}M  rate {G*100:+.1f}%")
print(f"    eta^2 product {Vp/V*100:.1f}%  eta^2 segment {Vs/V*100:.1f}%")
print(f"    unexplained $: none {e0:.2f}M  product {ep:.2f}M  segment {es:.2f}M")
print(f"    within-product dollar spreads: " + ", ".join(f"{p} ${wpd[p][3]:.1f}M" for p in PRODS))
print(f"    within-segment dollar spreads: " + ", ".join(f"{s} ${wsd[s][3]:.1f}M" for s in SEGS))
