import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

const DARK = "#ff0303";
const LIGHT = "#ff4242";

const CUBE_NAMES = ["one", "two", "three"] as const;
type CubeName = (typeof CUBE_NAMES)[number];

function CubePiece({ name }: { name: CubeName }) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!ref.current) return;
        const q = gsap.utils.selector(ref.current);

        /* colour-cycling timeline for the faces */
        const colorCycle = (t1: string, t2: string) => {
            const tl = gsap.timeline();
            tl.to(q(t1), { backgroundColor: DARK, duration: 2 });
            tl.to(q(t2), { backgroundColor: LIGHT, duration: 0 });
            return tl;
        };

        const colorTl = gsap.timeline({ delay: 2, repeat: -1, repeatDelay: 1 });
        colorTl.add(colorCycle(".face.behind", ".face.left"));
        colorTl.add(colorCycle(".face.right", ".face.behind"), "+=1");
        colorTl.add(colorCycle(".face.front", ".face.right"), "+=1");
        colorTl.add(colorCycle(".face.left", ".face.front"), "+=1");

        /* cube "one" starts stretched tall */
        if (name === "one") {
            gsap.set(ref.current, {
                scaleY: 2.22,
                transformOrigin: "bottom left",
            });
        }

        return () => {
            colorTl.kill();
        };
    }, [name]);

    return (
        <div className={`jq-cube jq-cube-${name}`} ref={ref}>
            <div className="face left" />
            <div className="face right" />
            <div className="face top" />
            <div className="face bottom" />
            <div className="face front" />
            <div className="face behind" />
        </div>
    );
}

/* ════════════════════════════════════════════
   Spinning wrapper – continuous rotation
   ════════════════════════════════════════════ */
function Spinning() {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!ref.current) return;

        gsap.set(ref.current, { rotate: 135 });

        const spinTl = gsap.timeline({ repeat: -1, delay: 1 }).to(ref.current, {
            duration: 12,
            rotate: 495,
            ease: "none",
        });

        return () => {
            spinTl.kill();
        };
    }, []);

    return (
        <div className="jq-spinning" ref={ref}>
            {CUBE_NAMES.map((n) => (
                <CubePiece key={n} name={n} />
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════
   CubeLoader – 3-D tilted base + morph loop
   ════════════════════════════════════════════ */
const DUR = 0.15; // duration of each sub-tween

/* morph-sequence lookup:
   [direction, target selector, translateVal1, translateVal2, transform-origin] */
const MORPH_STEPS: Record<
    number,
    ["X" | "Y", string, string | number, string | number, string]
> = {
    0: ["X", ".jq-cube-two", 0, "122%", "top left"],
    1: ["Y", ".jq-cube-three", 0, "122%", "top left"],
    2: ["X", ".jq-cube-one", 0, "-122%", "top right"],
    3: ["Y", ".jq-cube-two", 0, "-122%", "bottom left"],
    4: ["X", ".jq-cube-three", 0, "122%", "top left"],
    5: ["Y", ".jq-cube-one", "-122%", 0, "top left"],
    6: ["X", ".jq-cube-two", "122%", 0, "top right"],
    7: ["Y", ".jq-cube-three", 0, 0, "center"],
    8: ["X", ".jq-cube-one", "-122%", 0, "bottom left"],
    9: ["Y", ".jq-cube-two", "-122%", 0, "top left"],
    10: ["X", ".jq-cube-three", "122%", 0, "top right"],
};

export default function CubeLoader() {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!ref.current) return;
        const q = gsap.utils.selector(ref.current);

        /* tilt the whole assembly into isometric view */
        gsap.set(ref.current, { rotateX: 45 });

        /* helper: stretch → compress one cube along X or Y */
        const animateCube = (
            dir: "X" | "Y",
            target: string,
            tv1: string | number,
            tv2: string | number,
            origin: string
        ) => {
            const defaults: gsap.TweenVars = {
                transformOrigin: origin,
                duration: DUR,
                ease: "none",
            };
            const tl = gsap.timeline({ defaults });

            if (dir === "X") {
                tl.to(q(target), { scaleX: 2.22, translateX: tv1 });
                tl.to(q(target), { scaleX: 1, translateX: tv2 });
            } else {
                tl.to(q(target), { scaleY: 2.22, translateY: tv1 });
                tl.to(q(target), { scaleY: 1, translateY: tv2 });
            }
            return tl;
        };

        /* main morph timeline */
        const mainTl = gsap.timeline({ repeat: -1, delay: 1 });

        /* step 0 – collapse the tall cube upward */
        mainTl.to(q(".jq-cube-one"), {
            scaleY: 1,
            translateY: "-122%",
            transformOrigin: "bottom left",
            duration: DUR,
            ease: "none",
        });

        /* steps 1–11 – morph sequence through the 3 cubes */
        for (let i = 0; i < 11; i++) {
            const [dir, sel, t1, t2, origin] = MORPH_STEPS[i];
            mainTl.add(animateCube(dir, sel, t1, t2, origin));
        }

        /* restore initial stretched state to loop cleanly */
        mainTl.to(q(".jq-cube-one"), {
            scaleY: 2.22,
            transformOrigin: "bottom left",
            duration: DUR,
            ease: "none",
        });

        return () => {
            mainTl.kill();
        };
    }, []);

    return (
        <article className="jq-loader-base" ref={ref}>
            <Spinning />
        </article>
    );
}