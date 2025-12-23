/* Astro | Star Data
RA: 114 | DEC: -77 | MAG: 6
North Star: HR 3031
Loner Star: HR 2841
Center Star: HR 2993
Brightest Star: Zet Vol */

setcpm(20)

let s1 = stack(
  note("b5 ~ <b3 f#5> [g5 a3]").sound("marimba").pan(0).room("<1.0 0.9 0.3>").lpf(2420).hpf(115).gain(0.6),
  note("[a1 <c#6 d1 d1> <f#5 f#6 g#4>]").sound("oceandrum").pan(0).gain(0.15).attack(0.05).release(0.1).lpf(2410),
  sound("brown").gain(0.1).attack(0.5).release(1).pan(1).vowel('i').lpf(2593),
  note("~ e2 e1 b2 c#5 c2").sound("marimba").lpf(567).lpf(734).gain(0.5)
)

let s2 = stack(
  note("c#1 ~ <g7 a1> [g1 b4]").sound("strumstick").pan(0).room("<0.3 0.0 0.6>").crush(5).lpf(1022).gain(0.6),
  note("[d1 a2 b]").sound("pink").pan(0).gain(0.15).attack(0.05).release(0.1).lpf(356),
  sound("brown").gain(0.1).attack(0.5).release(1),
  note("~ ~ c6 <c#1 f6> e0 a3").sound("darbuka"),
  note("f4 ~").sound("<marimba piano1 vibraphone>").pan(0).crush(8).lpf(1464).gain(0.5)
)

let s3 = stack(
  note("c#2 ~ f4 [<e4 g c1> c2]").sound("fingercymbal").pan(0).room("<0.6 0.3 1.0>").gain(0.6),
  note("[e3 b1 <c a4 ~>]").sound("pink").pan(sine.range(0, 1).slow(4)).gain(0.15).attack(0.05).release(0.1).hpf(138),
  sound("brown").gain(0.1).attack(0.5).release(1).pan(1),
  note("~ <f#3 c3 f1> c#6 g#1 b g#5").sound("strumstick").crush(6).vowel('o').gain(0.5)
)

let s4 = stack(
  note("eb3 ~ a6 [a3 c2]").sound("strumstick").pan(0).room("<0.3 0.8 0.4>").lpf(1915).gain(0.6),
  note("[<c#5 e7 bb2> d2 c6]").sound("brown").pan(0).gain(0.15).attack(0.05).release(0.1).lpf(968),
  sound("brown").gain(0.1).attack(0.5).release(1),
  note("~ g0 c#1 a1 c0 g3").sound("glo").gain(0.5),
  note("c0 ~").sound("dantranh").pan(1).delay(0.61)
)

let p1 = sound("bd hh hh [sd sd]").bank("BossDR550")
let p2 = sound("bd sd bd sd").bank("DoepferMS404")
let p3 = sound("bd [hh hh] sd hh").bank("<CasioRZ1 BossDR550>").delay(0.48)
let p4 = sound("~ ~ ~ ~")

$: cat(s1, s2, s3, s4)
$: cat(p1, p2, p3, p4)