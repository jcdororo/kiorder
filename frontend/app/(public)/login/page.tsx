import LoginForm from "./login-form";

// 데모 계정의 단일 출처는 .env다. 같은 키를 /api/auth/auto-login 라우트도 읽으므로,
// 화면 안내와 자동 로그인이 서로 다른 계정을 가리키는 일이 생기지 않는다.
// 클라이언트 컴포넌트에선 서버 전용 env를 읽을 수 없어 여기서 읽어 props로 내린다.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  // 둘 중 하나라도 없으면 안내 박스를 아예 그리지 않는다 — undefined가 노출되는 것보다 낫다
  const demoAccount = email && password ? { email, password } : null;

  return <LoginForm demoAccount={demoAccount} />;
}
