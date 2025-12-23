/* Astro | Star Data
RA: 330 | DEC: -73 | MAG: 6
North Star: HR 8317
Loner Star: HR 8317
Center Star: Nu Ind
Brightest Star: Nu Ind */

setcpm(26)

let s1 = stack(
  note("b2 ~ c7 [f#4 c#4]").sound("wind").pan(0).room("<0.7 0.0 0.2>").gain(0.6),
  note("[<b4 c3 c#5> e3 c2]").sound("oceandrum").pan(0).gain(0.15).attack(0.05).release(0.1),
  sound("brown").gain(0.1).attack(0.5).release(1).pan(1).crush(4).delay(0.22),
  note("~ a5 c#5 c#3 g3 e7").sound("kawai").gain(0.5)
)

let s2 = stack(
  note("a6 ~ <a4 bb4 d1> [g#2 <d1 eb4 b2>]").sound("<darbuka rd>").pan(0).room("<0.4 0.9 1.0>").gain(0.6),
  note("[<g7 eb6 e3> f g#2]").sound("oceandrum").pan(0).gain(0.15).attack(0.05).release(0.1),
  sound("brown").gain(0.1).attack(0.5).release(1).hpf(798).hpf(669),
  note("~ c5 g6 <bb6 e6> e f1").sound("belltree").delay(0.17).hpf(211),
  note("f4 ~").sound("<vibraphone piano>").pan(0).hpf(607).gain(0.5)
)

let s3 = stack(
  note("<g2 f2 bb1> ~ g#1 [e0 c#4]").sound("wind").pan(0).room("<0.5 1.0 0.7>").gain(0.6),
  note("[c eb5 b]").sound("<pink brown brown>").pan(sine.range(0, 1).slow(4)).gain(0.15).attack(0.05).release(0.1).hpf(907),
  sound("brown").gain(0.1).attack(0.5).release(1).pan(1).delay(0.13),
  note("~ <e6 c6> b3 d6 c#3 <f#1 bb4>").sound("piano").crush(13).gain(0.5)
)

let s4 = stack(
  note("eb3 ~ bb2 [g1 b2]").sound("fingercymbal").pan(0).room("<0.1 0.1 1.0>").hpf(136).gain(0.6),
  note("[a5 c#6 b1]").sound("<oceandrum oceandrum>").pan(0).gain(0.15).attack(0.05).release(0.1),
  sound("brown").gain(0.1).attack(0.5).release(1).vowel('a').vowel('u'),
  note("~ <c6 a4> g1 f#1 <a1 e6 b5> bb5").sound("sine").crush(6).gain(0.5),
  note("g#2 ~").sound("kawai").pan(1)
)

let p1 = sound("bd hh hh [sd sd]").bank("DoepferMS404").vowel('e')
let p2 = sound("~ ~ ~ ~")
let p3 = sound("bd hh sd hh").bank("DoepferMS404").hpf(948).delay(0.5)
let p4 = sound("bd hh hh hh").bank("RolandTR626").crush(16).hpf(692)

$: cat(s1, s2, s3, s4)
$: cat(p1, p2, p3, p4)