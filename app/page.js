// Next.jsでページ遷移するためにLinkを使う
import Link from "next/link";


export default function HomePage() {

  return (
    <main>

      {/* 自己紹介 */}
      <section>

        <h1>
          Takumi
        </h1>

        <p>
          就職活動向けの自己紹介・ポートフォリオサイトです。
        </p>

        <p>
          面接で聞かれそうな質問への回答や、
          開発経験・研究内容をまとめています。
        </p>

      </section>


      {/* Interviewへの導線 */}
      <section>

        <h2>
          Interview Q&A
        </h2>

        <p>
          面接で聞かれそうな質問と回答をまとめています。
        </p>

        <Link href="/interview">
          Q&Aを見る
        </Link>

      </section>


      {/* Projectsへの導線 */}
      <section>

        <h2>
          Projects
        </h2>

        <p>
          これまで取り組んできた開発経験をまとめています。
        </p>

        <Link href="/projects">
          Projectsを見る
        </Link>

      </section>


      {/* GitHubへのリンク */}
      <section>

        <h2>
          GitHub
        </h2>

        <a
          href="https://github.com/takumi0708"
          // 新たなタブで表示
          target="_blank"
        >
          GitHubを見る
        </a>

      </section>

    </main>
  );
}