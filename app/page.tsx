"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BrainCircuit,
  ChevronDown,
  Dumbbell,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { MuscleMap, type BodyType, type ViewSide } from "./components/MuscleMap";

type Exercise = { id: number; name: string; sets: number; reps: number };

const exerciseCatalog: Record<string, Record<string, number>> = {
  "Barbell Bench Press": { chest: 1, shoulders: .42, triceps: .62, forearms: .12 },
  "Push-Up": { chest: .9, shoulders: .35, triceps: .55, abs: .18, forearms: .1 },
  "Shoulder Press": { shoulders: 1, triceps: .62, chest: .22 },
  "Lat Pulldown": { lats: 1, biceps: .58, forearms: .38 },
  "Seated Row": { lats: .92, biceps: .52, shoulders: .2, forearms: .42 },
  "Face Pull": { shoulders: .82, lats: .58, biceps: .2, forearms: .28 },
  "Biceps Curl": { biceps: 1, forearms: .5 },
  "Triceps Pushdown": { triceps: 1, forearms: .22 },
  "Back Squat": { quads: 1, glutes: .72, hamstrings: .35, abs: .25 },
  "Romanian Deadlift": { hamstrings: 1, glutes: .82, lats: .25, forearms: .45 },
  "Walking Lunge": { quads: .82, glutes: .78, hamstrings: .38, calves: .2 },
  "Standing Calf Raise": { calves: 1 },
  "Plank": { abs: 1, shoulders: .22, glutes: .12 },
};

const demo: Exercise[] = [
  { id: 1, name: "Barbell Bench Press", sets: 4, reps: 10 },
  { id: 2, name: "Lat Pulldown", sets: 3, reps: 12 },
  { id: 3, name: "Back Squat", sets: 4, reps: 8 },
  { id: 4, name: "Shoulder Press", sets: 3, reps: 10 },
];

const presets: Record<string, Omit<Exercise, "id">[]> = {
  "Balanced sample": demo,
  "Push day": [
    { name: "Barbell Bench Press", sets: 4, reps: 8 },
    { name: "Shoulder Press", sets: 3, reps: 10 },
    { name: "Triceps Pushdown", sets: 3, reps: 12 },
  ],
  "Pull day": [
    { name: "Lat Pulldown", sets: 4, reps: 10 },
    { name: "Seated Row", sets: 4, reps: 10 },
    { name: "Biceps Curl", sets: 3, reps: 12 },
  ],
  "Leg day": [
    { name: "Back Squat", sets: 4, reps: 8 },
    { name: "Romanian Deadlift", sets: 3, reps: 10 },
    { name: "Walking Lunge", sets: 3, reps: 12 },
    { name: "Standing Calf Raise", sets: 4, reps: 15 },
  ],
};

const muscleKeys = ["chest", "shoulders", "triceps", "lats", "biceps", "forearms", "abs", "quads", "glutes", "hamstrings", "calves"];

const names: Record<string, string> = {
  chest: "Chest", shoulders: "Shoulders", triceps: "Triceps",
  lats: "Back", biceps: "Biceps", forearms: "Forearms", abs: "Abs & core",
  quads: "Quads", glutes: "Glutes", hamstrings: "Hamstrings", calves: "Calves",
};

export default function Home() {
  const [exercises, setExercises] = useState<Exercise[]>(demo);
  const [analyzedExercises, setAnalyzedExercises] = useState<Exercise[]>(demo);
  const [preset, setPreset] = useState("Balanced sample");
  const [bodyType, setBodyType] = useState<BodyType>("male");
  const [view, setView] = useState<ViewSide>("front");
  const [selected, setSelected] = useState("chest");
  const [analyzed, setAnalyzed] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const volume = useMemo(() => exercises.reduce((sum, item) => sum + item.sets * item.reps, 0), [exercises]);
  const scores = useMemo(() => {
    const load = Object.fromEntries(muscleKeys.map((muscle) => [muscle, 0])) as Record<string, number>;
    analyzedExercises.forEach((exercise) => {
      const profile = exerciseCatalog[exercise.name] ?? {};
      Object.entries(profile).forEach(([muscle, share]) => {
        load[muscle] += exercise.sets * exercise.reps * share;
      });
    });
    return Object.fromEntries(muscleKeys.map((muscle) => [muscle, Math.round(100 * (1 - Math.exp(-load[muscle] / 25)))]));
  }, [analyzedExercises]);

  const balance = useMemo(() => ({
    PUSH: Math.round((scores.chest + scores.shoulders + scores.triceps) / 3),
    PULL: Math.round((scores.lats + scores.biceps) / 2),
    LEGS: Math.round((scores.quads + scores.glutes + scores.hamstrings + scores.calves) / 4),
    CORE: scores.abs,
  }), [scores]);

  function updateExercise(id: number, field: keyof Exercise, value: string | number) {
    setPreset("Custom workout");
    setExercises((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function loadPreset(name: string) {
    if (!presets[name]) return;
    setPreset(name);
    setExercises(presets[name].map((exercise, index) => ({ ...exercise, id: Date.now() + index })));
  }

  function analyze() {
    setAnalyzing(true);
    setAnalyzed(false);
    window.setTimeout(() => {
      setAnalyzedExercises(exercises.map((exercise) => ({ ...exercise })));
      setAnalyzing(false);
      setAnalyzed(true);
    }, 900);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Activity size={19} strokeWidth={2.4} /></div>
          <div><span>AI</span> MUSCLE MAP</div>
          <div className="version">BETA</div>
        </div>
        <div className="status-pill"><span /> INTERACTIVE ANALYSIS · LIVE</div>
        <div className="header-meta">
          <div><span>MODEL</span><b>ANATOMY v1.0</b></div>
          <div className="secure"><ShieldCheck size={16} /><span>Privacy-first<br/><b>No data stored</b></span></div>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> INTERACTIVE TRAINING INTELLIGENCE</p>
          <h1>See what your workout<br/><em>actually trains.</em></h1>
        </div>
        <p className="intro-copy">Build your session and explore estimated muscle activation on an interactive anatomical model. <span>Adjust your workout to compare activation patterns.</span></p>
      </section>

      <section className="workspace">
        <aside className="panel workout-panel">
          <div className="panel-heading">
            <div><span className="step">01</span><div><p>WORKOUT INPUT</p><h2>Build your session</h2></div></div>
            <label className="preset-picker">
              <span>SAMPLE</span>
              <select aria-label="Workout sample" value={preset} onChange={(e) => loadPreset(e.target.value)}>
                {Object.keys(presets).map((name) => <option key={name}>{name}</option>)}
                {preset === "Custom workout" && <option>Custom workout</option>}
              </select>
            </label>
          </div>

          <div className="column-labels"><span>EXERCISE</span><span>SETS</span><span>REPS</span><span /></div>
          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <div className="exercise-row" key={exercise.id}>
                <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="exercise-name">
                  <Dumbbell size={15} />
                  <select aria-label={`Exercise ${index + 1}`} value={exercise.name} onChange={(e) => updateExercise(exercise.id, "name", e.target.value)}>
                    {Object.keys(exerciseCatalog).map((name) => <option key={name}>{name}</option>)}
                  </select>
                  <ChevronDown className="select-chevron" size={14} />
                </div>
                <input className="number-input" aria-label="Sets" type="number" min="1" max="10" value={exercise.sets} onChange={(e) => updateExercise(exercise.id, "sets", Number(e.target.value))}/>
                <input className="number-input" aria-label="Reps" type="number" min="1" max="100" value={exercise.reps} onChange={(e) => updateExercise(exercise.id, "reps", Number(e.target.value))}/>
                <button className="icon-button" aria-label="Remove exercise" onClick={() => { setPreset("Custom workout"); setExercises((items) => items.filter((item) => item.id !== exercise.id)); }}><Trash2 size={15}/></button>
              </div>
            ))}
          </div>

          <button className="add-button" disabled={exercises.length >= 8} onClick={() => { setPreset("Custom workout"); setExercises((items) => [...items, { id: Date.now(), name: "Barbell Bench Press", sets: 3, reps: 10 }]); }}><Plus size={16}/> ADD EXERCISE <span>{exercises.length}/8</span></button>

          <div className="workout-stats">
            <div><span>TOTAL SETS</span><b>{exercises.reduce((n, x) => n + x.sets, 0)}</b></div>
            <div><span>TOTAL REPS</span><b>{volume}</b></div>
            <div><span>EST. TIME</span><b>{Math.max(5, exercises.reduce((n, x) => n + x.sets, 0) * 3)}<small> MIN</small></b></div>
          </div>
          <button className="analyze-button" onClick={analyze} disabled={!exercises.length || analyzing}>
            {analyzing ? <><span className="pulse-dot"/> MAPPING MUSCLE LOAD…</> : <><Zap size={17} fill="currentColor"/> ANALYZE WORKOUT</>}
          </button>
          <p className="limit-note"><ShieldCheck size={13}/> Results update when you analyze the workout</p>
        </aside>

        <section className="panel model-panel">
          <div className="panel-heading compact">
            <div><span className="step">02</span><div><p>3D ACTIVATION MAP</p><h2>Muscular anatomy</h2></div></div>
            <div className="body-toggle" role="group" aria-label="Body type">
              <button className={bodyType === "male" ? "active" : ""} onClick={() => setBodyType("male")}>MALE</button>
              <button className={bodyType === "female" ? "active" : ""} onClick={() => setBodyType("female")}>FEMALE</button>
            </div>
          </div>
          <div className="canvas-wrap">
            <div className="scanline" />
            <MuscleMap scores={scores} bodyType={bodyType} view={view} selected={selected} onSelect={setSelected} />
            <div className="model-label top"><span /> DRAG TO ROTATE · SCROLL TO ZOOM</div>
            <div className="orientation"><span>L</span><i/><span>R</span></div>
            <div className="muscle-tooltip"><span>{names[selected]}</span><strong>{scores[selected]}%</strong><small>EST. ACTIVATION</small></div>
          </div>
          <div className="view-controls">
            <button className={view === "front" ? "active" : ""} onClick={() => setView("front")}>FRONT</button>
            <button className={view === "back" ? "active" : ""} onClick={() => setView("back")}>BACK</button>
            <button onClick={() => setView("reset")}><RotateCcw size={14}/> RESET</button>
          </div>
          <div className="heat-legend"><span>ACTIVATION</span><i className="gradient"/><span>LOW</span><span>HIGH</span></div>
        </section>

        <aside className={`panel analysis-panel ${analyzed ? "revealed" : ""}`}>
          <div className="panel-heading">
            <div><span className="step">03</span><div><p>SAMPLE ANALYSIS</p><h2>Training intelligence</h2></div></div>
            <BrainCircuit size={22} className="brain" />
          </div>

          <section className="analysis-block">
            <div className="section-title"><span>WORKOUT BALANCE</span><b>LIVE SAMPLE</b></div>
            <div className="balance-grid">
              {Object.entries(balance).map(([label, value]) => (
                <div key={label as string}><div className="ring" style={{"--score": `${value}%`} as React.CSSProperties}><span>{value}</span><small>%</small></div><b>{label}</b></div>
              ))}
            </div>
          </section>

          <section className="analysis-block muscles-block">
            <div className="section-title"><span>TOP ACTIVATED</span><button>VIEW ALL</button></div>
            {Object.entries(scores).sort((a,b) => b[1]-a[1]).slice(0,5).map(([muscle, value], i) => (
              <button className={`muscle-bar ${selected === muscle ? "selected" : ""}`} key={muscle} onClick={() => setSelected(muscle)}>
                <span className="rank">0{i+1}</span><span className="bar-name">{names[muscle]}</span><i><em style={{width: `${value}%`}}/></i><b>{value}%</b>
              </button>
            ))}
          </section>

          <section className="insight-card">
            <div className="insight-label"><Sparkles size={13}/> SAMPLE INSIGHT</div>
            <p>Your highest training emphasis is <b>{Object.entries(balance).sort((a, b) => b[1] - a[1])[0][0].toLowerCase()}</b>. Change an exercise, set, or rep count to see this summary and the body heatmap update instantly.</p>
          </section>

          <section className="recommendations">
            <div className="section-title"><span>RECOMMENDED ADDITIONS</span></div>
            <button onClick={() => setExercises((x) => [...x, {id: Date.now(), name: "Romanian Deadlift", sets: 3, reps: 10}])}><span>01</span><div><b>Romanian Deadlift</b><small>HAMSTRINGS · GLUTES · BACK</small></div><Plus size={15}/></button>
            <button onClick={() => setExercises((x) => [...x, {id: Date.now()+1, name: "Face Pull", sets: 3, reps: 15}])}><span>02</span><div><b>Face Pull</b><small>REAR DELTS · UPPER BACK</small></div><Plus size={15}/></button>
          </section>
          <div className="analysis-footer"><span><i/> ESTIMATED VALUES</span><span>NOT MEDICAL ADVICE</span></div>
        </aside>
      </section>
      <footer><span>AI MUSCLE MAP / INTERACTIVE PROTOTYPE</span><p>3D body model by <a href="https://skfb.ly/6QYp6" target="_blank" rel="noreferrer">Toadstool022</a> · CC BY 4.0</p><span>ESTIMATED ACTIVATION DATA</span></footer>
    </main>
  );
}
