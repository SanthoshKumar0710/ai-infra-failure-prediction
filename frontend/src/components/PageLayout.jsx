import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function PageLayout({ children }) {
  return (
    <div className="app-shell">

      <Sidebar />

      <main className="main-content">

        <Topbar />

        <div className="dashboard-content">
          {children}
        </div>

      </main>

    </div>
  );
}

export default PageLayout;