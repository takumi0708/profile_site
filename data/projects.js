// プロジェクト一覧の仮データ
// あとでSupabaseなどに移すこともできる

export const projects = [
    {
        id: 1,
        title: "動物園画像解析システム",
        summary: "DeepLabCutとAzureを使って、動物画像から身体部位を推定するシステムを開発。",
        technologies: ["Python", "DeepLabCut", "Docker", "Azure"],
    },
    {
        id: 2,
        title: "Interview Portfolio",
        summary: "面接Q&Aを中心に、自分の経験や考えを深掘りできるポートフォリオサイト。",
        technologies: ["Next.js", "React", "Tailwind CSS"],
    },
    {
        id: 3,
        title: "EEG解析",
        summary: "瞑想時EEGの周波数特徴と個人差を分析する研究。",
        technologies: ["MATLAB", "EEGLAB", "Statistics"],
    },
];