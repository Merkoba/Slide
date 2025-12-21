/*
  TITLE: The Infinite Slide
  CONCEPT: A conversation between Slide Hampton's drone and Herbie's electronics.
  DEVELOPMENT: Arrived at by layering quartal jazz voicings with
  generative ambient landscapes and rhythmic filter-chirps.
  MADE BY: The Thought Partner & The Slide Engine
*/

setcpm(28)

let trombone_drone = note("[c3,f3,bb3,eb4] [g2,c3,f3,bb3]")
    .s("sawtooth")
    .lpf(400)
    .lpq(2)
    .attack(0.8)
    .release(2)
    .legato(1)
    .slow(4)
    .gain(0.5)
    .pan(0.6)

let herbie_bubbles = note("c2 [~ eb2] g2 [~ bb2]")
  .s("square")
  .lpf(perlin.range(200, 1500))
  .lpq(15)
  .delay(0.6)
  .delayfeedback(0.7)
  .gain(0.6)
  .slow(2)
  .pan(0.1)

let eno_landscape = note("g5 b5 d6 f6")
  .s("sine")
  .jux(rev)
  .slow(16)
  .mask("<1 0 1 1 0>")
  .room(0.9)
  .size(0.9)
  .gain(0.2)

let scientist_dub_echo = s("rim")
  .delay(0.75)
  .delayfeedback(0.85) // nearly infinite feedback loop
  .lpq(20)             // resonant "whistle" on the echo
  .lpf(sine.range(500, 2500).slow(2)) // filter "ghost" movement
  .gain(0.25)
  .slow(8)

stack(
  trombone_drone,
  herbie_bubbles,
  eno_landscape,
  scientist_dub_echo
)