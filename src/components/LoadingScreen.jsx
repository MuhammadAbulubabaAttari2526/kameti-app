const LoadingScreen = () => (
  <main className="vip-loading">
    <div className="vip-aura aura-one" />
    <div className="vip-aura aura-two" />
    <div className="vip-loader-card">
      <div className="vip-logo"><span className="vip-logo-k">K</span></div>
      <div className="vip-wordmark">Kameti<span>App</span></div>
      <p>Digital Committee System</p>
      <div className="vip-progress"><span /></div>
      <div className="vip-status"><i /> Connecting securely to your workspace</div>
    </div>
  </main>
);

export default LoadingScreen;
