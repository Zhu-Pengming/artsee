import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款 — Artiqore",
  description: "Artiqore 服务条款与用户协议",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-on-surface mb-4">
          服务条款
        </h1>
        <p className="text-sm text-on-surface-variant mb-12">
          最后更新日期：2024 年 12 月
        </p>

        <div className="prose prose-slate max-w-none text-on-surface-variant space-y-8">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. 接受条款</h2>
            <p className="leading-relaxed">
              欢迎使用 Artiqore（以下简称"本平台"）。当您访问、浏览或使用本平台提供的任何服务时，即表示您已阅读、理解并同意受本服务条款的约束。如果您不同意本条款的任何内容，请立即停止使用本平台服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. 服务内容</h2>
            <p className="leading-relaxed mb-3">
              Artiqore 是一个面向艺术留学领域的综合性数字平台，致力于连接艺术家、策展人、收藏家及艺术爱好者。我们提供的服务包括但不限于：
            </p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>艺术院校与项目信息展示与查询</li>
              <li>留学案例、作品集与申请经验分享</li>
              <li>艺术家名录与作品展示</li>
              <li>艺术教育课程与学习资源</li>
              <li>社区讨论、问答与资讯交流</li>
              <li>奢侈品与艺术品牌的合作对接服务</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. 用户账号</h2>
            <p className="leading-relaxed">
              您需要注册一个账号才能使用本平台的全部功能。您承诺在注册过程中提供的所有信息真实、准确、完整，并在信息发生变更时及时更新。您有责任妥善保管账号密码，并对账号下的所有活动承担全部责任。如发现任何未经授权的使用，请立即通知我们。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. 用户行为规范</h2>
            <p className="leading-relaxed mb-3">
              在使用本平台服务时，您同意不会从事以下行为：
            </p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>发布任何违法、侵权、虚假、骚扰、诽谤、淫秽或含有仇恨言论的内容</li>
              <li>侵犯他人的知识产权、隐私权或其他合法权益</li>
              <li>利用本平台从事任何商业广告、垃圾信息传播或欺诈活动</li>
              <li>试图干扰、破坏或侵入本平台的服务器、网络或安全系统</li>
              <li>未经授权收集其他用户的个人信息</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. 知识产权</h2>
            <p className="leading-relaxed">
              本平台的所有内容，包括但不限于文字、图片、视频、音频、软件、代码、商标、标识及页面设计，均受知识产权法律法规保护，归 Artiqore 或其权利人所有。未经书面许可，任何个人或组织不得复制、修改、传播、出售或用于商业目的。
            </p>
            <p className="leading-relaxed mt-3">
              用户在本平台发布的内容，其知识产权归用户本人所有。您授予 Artiqore 一项非独占的、全球性的、免费的许可，允许我们在平台运营所需的范围内使用、展示、复制和分发该内容。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. 免责声明</h2>
            <p className="leading-relaxed">
              本平台按"现状"提供服务，不担保服务的绝对及时性、安全性、准确性或适用性。对于因网络中断、系统维护、不可抗力或第三方原因导致的服务暂停或数据丢失，我们不承担责任。用户通过本平台获取的任何信息仅供参考，不构成专业法律、教育或投资建议。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">7. 协议修改</h2>
            <p className="leading-relaxed">
              我们有权根据实际情况和法律法规的变化，随时修改本服务条款。修改后的条款将在本平台公示，公示后即生效。如果您在条款修改后继续使用本平台服务，视为您已接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">8. 联系我们</h2>
            <p className="leading-relaxed">
              如您对本服务条款有任何疑问，请通过以下方式与我们联系：
            </p>
            <p className="leading-relaxed mt-2">
              电子邮箱：contact@artiqore.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
