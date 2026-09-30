"use client";

// Flip is only needed by the section archive filter, so it lives in its own
// module to keep it out of every other page's bundle.
import { gsap } from "./motion";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export { Flip };
