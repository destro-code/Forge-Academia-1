import { ArrowUpRight, Check, CircleDashed, Hammer, NotebookPen, Sparkles, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useProgress } from "@/lib/hooks/use-progress";
import projectsData from "@/data/projects.json";
import achievementsData from "@/data/achievements.json";
import lessonsData from "@/data/lessons.json";
import { evaluateAchievements } from "@/lib/utils/achievements";
import type { Project } from "@/lib/types";

const projects = projectsData as Project[];

function ProjectProgressCard({ project, progress }: { project: Project; progress: ReturnType<typeof useProgress> }) {
  const tasks = (project.milestones ?? []).flatMap((milestone) => milestone.tasks ?? []);
  const criteria = project.acceptanceCriteria ?? [];
  const tasksDone = tasks.filter((task) => progress.projectTasks?.[`${project.id}:${task.id}`]).length;
  const criteriaDone = criteria.filter((criterion) => progress.projectCriteria?.[`${project.id}:${criterion.id}`]).length;
  const reflection = progress.projectReflections?.[project.id];
  const notes = progress.projectPortfolioNotes?.[project.id];
  const hasReflection = Boolean(reflection && Object.values(reflection).some((value) => typeof value === "string" && value.trim()));
  const hasNotes = Boolean(notes && Object.values(notes).some((value) => typeof value === "string" && value.trim()));
  const completed = progress.completedProjects?.includes(project.id) || (criteria.length > 0 && criteriaDone === criteria.length);
  const started = !completed && (tasksDone > 0 || criteriaDone > 0 || hasReflection || hasNotes);
  const totalSignals = tasks.length + criteria.length;
  const doneSignals = tasksDone + criteriaDone;
  const percent = totalSignals > 0 ? Math.round((doneSignals / totalSignals) * 100) : 0;

  return (
    <Link to="/projects/$projectId" params={{ projectId: project.id }} className="group block rounded-[24px] border-2 border-[#0E1B3D]/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#0E1B3D]/30 hover:shadow-[5px_5px_0_#0E1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF]">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${completed ? "bg-[#A7E3D1]" : "bg-[#FFF0C4]"} text-[#0E1B3D]`}>
          {completed ? <Check size={20} /> : <Hammer size={20} />}
        </span>
        <span className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${completed ? "bg-[#E9F8F2] text-[#17654F]" : started ? "bg-[#EEF0FF] text-[#354BD2]" : "bg-[#F4F0E9] text-[#666B78]"}`}>
          {completed ? "Completed" : started ? "In progress" : "Ready to start"}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-extrabold leading-tight text-[#0E1B3D]">{project.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#596174]">{project.subtitle || project.description}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-[#596174]">
        <span>{tasksDone}/{tasks.length} tasks</span>
        <span>{criteriaDone}/{criteria.length} criteria</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDEAE4]"><div className="h-full rounded-full bg-[#4F6BFF] transition-[width]" style={{ width: `${completed ? 100 : percent}%` }} /></div>
      <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#4F6BFF]">
        <span>{completed ? "Review your project" : started ? "Pick up where you left off" : "Open project workspace"}</span>
        <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function BuildersPinboard() {
  const progress = useProgress();
  const projectStatuses = projects.map((project) => {
    const tasks = (project.milestones ?? []).flatMap((milestone) => milestone.tasks ?? []);
    const criteria = project.acceptanceCriteria ?? [];
    const tasksDone = tasks.filter((task) => progress.projectTasks?.[`${project.id}:${task.id}`]).length;
    const criteriaDone = criteria.filter((criterion) => progress.projectCriteria?.[`${project.id}:${criterion.id}`]).length;
    const reflection = progress.projectReflections?.[project.id];
    const notes = progress.projectPortfolioNotes?.[project.id];
    const hasReflection = Boolean(reflection && Object.values(reflection).some((value) => typeof value === "string" && value.trim()));
    const hasNotes = Boolean(notes && Object.values(notes).some((value) => typeof value === "string" && value.trim()));
    const completed = progress.completedProjects?.includes(project.id) || (criteria.length > 0 && criteriaDone === criteria.length);
    const started = !completed && (tasksDone > 0 || criteriaDone > 0 || hasReflection || hasNotes);
    return { project, completed, started };
  });
  const featured = projectStatuses.find((item) => item.started) ?? projectStatuses.find((item) => item.completed);
  const starter = projects[0];
  const activeProject = featured?.project ?? starter;
  const achievements = evaluateAchievements(achievementsData, progress, lessonsData);
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  const nextSticker = achievements.filter((achievement) => !achievement.unlocked).sort((a, b) => b.progress - a.progress)[0];

  if (!activeProject) return null;

  return (
    <section aria-labelledby="builders-pinboard-title" className="min-w-0">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#4F6BFF]">Zone 03 · make it real</p>
          <h2 id="builders-pinboard-title" className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl">The Builder’s Pinboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596174]">A living snapshot of the things you’re making, finishing, and earning along the way.</p>
        </div>
        <Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-[#0E1B3D]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#0E1B3D] hover:border-[#4F6BFF]">All projects <ArrowUpRight size={15} /></Link>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <div className="rounded-[30px] border-2 border-[#0E1B3D] bg-[#FFF6ED] p-5 shadow-[7px_7px_0_#0E1B3D] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#596174]"><NotebookPen size={14} /> Project workbench</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#596174]">{featured?.started ? "In the making" : featured?.completed ? "On the shelf · finished" : "Your next build"}</span>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-[1fr_.8fr] md:items-center">
            <div>
              <h3 className="font-display text-2xl font-extrabold leading-tight text-[#0E1B3D] sm:text-3xl">{featured ? activeProject.title : "Start a guided project"}</h3>
              <p className="mt-3 text-sm leading-6 text-[#596174]">{featured ? activeProject.subtitle || activeProject.description : "Choose a real-world build and turn the lessons you’ve practised into something you can show."}</p>
              <Link to="/projects/$projectId" params={{ projectId: activeProject.id }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4F6BFF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#354BD2]">
                {featured?.started ? "Continue building" : featured?.completed ? "Revisit project" : "Choose your first build"} <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="relative mx-auto grid aspect-square w-full max-w-[220px] place-items-center rounded-[28px] border-2 border-[#0E1B3D] bg-[#A7E3D1]">
              <div className="absolute left-4 top-4 h-3 w-3 rounded-full border-2 border-[#0E1B3D] bg-[#FF8C7A]" />
              <div className="absolute right-4 top-4 h-3 w-3 rounded-full border-2 border-[#0E1B3D] bg-[#FFE08A]" />
              <div className="w-[72%] rounded-2xl border-2 border-[#0E1B3D] bg-[#FFFDF9] p-4 shadow-[5px_5px_0_#0E1B3D]">
                <div className="mb-3 flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#FF8C7A]" /><i className="h-2 w-2 rounded-full bg-[#FFE08A]" /><i className="h-2 w-2 rounded-full bg-[#A7E3D1]" /></div>
                <div className="h-2 w-4/5 rounded-full bg-[#4F6BFF]" /><div className="mt-2 h-2 w-3/5 rounded-full bg-[#C9BBFF]" /><div className="mt-4 grid grid-cols-3 gap-1.5"><i className="h-8 rounded-md bg-[#FFE08A]" /><i className="h-8 rounded-md bg-[#FF8C7A]" /><i className="h-8 rounded-md bg-[#A7E3D1]" /></div>
              </div>
              <span className="absolute -bottom-3 right-3 rotate-[-4deg] rounded-md border-2 border-[#0E1B3D] bg-[#FFE08A] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wide text-[#0E1B3D]">Work in progress</span>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border-2 border-[#0E1B3D]/10 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#596174]">Achievement shelf</p><h3 className="mt-2 text-xl font-extrabold text-[#0E1B3D]">Your earned stickers</h3></div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFF0C4] text-[#0E1B3D]"><Trophy size={20} /></span>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <span className="text-3xl font-extrabold text-[#0E1B3D]">{unlocked.length}</span><span className="text-sm text-[#596174]">of {achievements.length} collected</span>
          </div>
          {unlocked.length ? <div className="mt-4 flex flex-wrap gap-2">{unlocked.slice(0, 8).map((achievement) => <span key={achievement.id} title={achievement.description} className="inline-flex items-center gap-1.5 rounded-full border border-[#0E1B3D]/10 bg-[#E9F8F2] px-3 py-2 text-xs font-bold text-[#17654F]"><Sparkles size={13} />{achievement.title}</span>)}</div> : <p className="mt-4 rounded-2xl bg-[#F8F6F0] p-4 text-sm leading-6 text-[#596174]">Your sticker shelf is waiting for its first spark. Finish a lesson to earn one.</p>}
          {nextSticker && <div className="mt-5 rounded-2xl border border-dashed border-[#0E1B3D]/20 bg-[#FBFAF7] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#596174]"><CircleDashed size={15} /> Next sticker on your workbench</div>
            <p className="mt-2 font-extrabold text-[#0E1B3D]">{nextSticker.title}</p>
            <p className="mt-1 text-xs leading-5 text-[#596174]">{nextSticker.description}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDEAE4]"><div className="h-full rounded-full bg-[#FF8C7A]" style={{ width: `${Math.round(nextSticker.progress * 100)}%` }} /></div>
            <p className="mt-2 font-mono text-[10px] text-[#596174]">{Math.round(nextSticker.progress * 100)}% toward unlock</p>
          </div>}
        </div>
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projectStatuses.filter((item) => item.started || item.completed).slice(0, 2).map(({ project }) => <ProjectProgressCard key={project.id} project={project} progress={progress} />)}
        {!featured && starter && <ProjectProgressCard project={starter} progress={progress} />}
      </div>
    </section>
  );
}
