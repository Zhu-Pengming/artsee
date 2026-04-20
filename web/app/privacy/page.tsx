import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 — ArtLink",
  description: "ArtLink 隐私政策",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-on-surface mb-4">
          隐私政策
        </h1>
        <p className="text-sm text-on-surface-variant mb-12">
          最后更新日期：2024 年 12 月
        </p>

        <div className="prose prose-slate max-w-none text-on-surface-variant space-y-8">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. 引言</h2>
            <p className="leading-relaxed">
              ArtLink（以下简称"我们"）高度重视用户的隐私和个人信息保护。本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息。请您在使用本平台服务前仔细阅读本政策。一旦您开始使用我们的服务，即表示您已同意本隐私政策的全部内容。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. 信息收集</h2>
            <p className="leading-relaxed mb-3">
              我们可能通过以下方式收集您的信息：
            </p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>
                <strong>您提供的信息：</strong>
                包括但不限于注册账号时填写的昵称、邮箱、手机号，以及您主动填写的个人资料、作品集、申请背景等信息。
              </li>
              <li>
                <strong>自动收集的信息：</strong>
                当您访问本平台时，我们可能会自动收集您的设备信息、浏览器类型、IP 地址、访问时间、页面浏览记录及 Cookie 信息，以优化服务体验。
              </li>
              <li>
                <strong>第三方信息：</strong>
                如您通过微信等第三方平台登录，我们可能会从该等第三方获取您授权共享的公开信息（如头像、昵称）。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. 信息使用</h2>
            <p className="leading-relaxed mb-3">
              我们收集您的个人信息主要用于以下目的：
            </p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>为您提供账号注册、登录及身份验证服务</li>
              <li>展示和推荐您可能感兴趣的艺术内容、院校项目及案例</li>
              <li>处理您的咨询、反馈和客户服务请求</li>
              <li>进行数据分析，以改进平台功能、安全性和用户体验</li>
              <li>向您发送服务通知、活动信息及营销资讯（您可随时退订）</li>
              <li>履行法律法规规定的义务，防范欺诈和安全风险</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. 信息共享</h2>
            <p className="leading-relaxed">
              我们不会将您的个人信息出售给任何第三方。但在以下情形中，我们可能会与第三方共享您的信息：
            </p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed mt-3">
              <li>
                <strong>服务提供商：</strong>
                我们可能会委托第三方服务提供商（如云存储、数据分析、短信发送服务商）处理您的信息，且要求其遵守不低于本政策的保密义务。
              </li>
              <li>
                <strong>法律要求：</strong>
                如法律法规、法院命令或政府部门要求，我们可能会披露您的信息。
              </li>
              <li>
                <strong>合法权益保护：</strong>
                为保护 ArtLink、用户或公众的合法权益、财产或安全，我们可能会在必要范围内披露信息。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. 信息保护</h2>
            <p className="leading-relaxed">
              我们采用行业标准的安全技术和管理措施来保护您的个人信息，防止数据遭到未经授权的访问、泄露、篡改或丢失。包括但不限于：数据加密传输、访问控制、定期安全审计等。请您理解，互联网环境并非绝对安全，尽管我们已尽力采取合理措施，仍无法完全排除风险。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Cookie 与类似技术</h2>
            <p className="leading-relaxed">
              为了提升您的使用体验，我们可能会使用 Cookie 和类似技术来收集和存储有关您访问本平台的偏好信息。您可以通过修改浏览器设置来选择拒绝 Cookie，但部分功能可能会因此受到影响。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">7. 用户权利</h2>
            <p className="leading-relaxed mb-3">
              根据适用的法律法规，您对自己的个人信息享有以下权利：
            </p>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>访问、更正或更新您的个人资料</li>
              <li>删除您的账号及相关个人信息</li>
              <li>撤回对我们处理您信息的同意（但不会影响此前基于同意已进行的处理）</li>
              <li>拒绝接收营销信息</li>
            </ul>
            <p className="leading-relaxed mt-3">
              如需行使上述权利，请通过本政策末尾的联系方式与我们联系。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">8. 未成年人保护</h2>
            <p className="leading-relaxed">
              本平台主要面向成年人用户。如果您是未成年人，请在监护人指导下使用我们的服务。我们不会主动收集未成年人的个人信息，如我们发现意外收集了未成年人的信息，将尽快删除。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">9. 政策更新</h2>
            <p className="leading-relaxed">
              我们可能会根据业务发展和法律要求不时更新本隐私政策。更新后的政策将在本平台显著位置发布，并标注最新生效日期。请您定期查阅以了解最新的隐私保护措施。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">10. 联系我们</h2>
            <p className="leading-relaxed">
              如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式与我们联系：
            </p>
            <p className="leading-relaxed mt-2">
              电子邮箱：contact@artlink.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
