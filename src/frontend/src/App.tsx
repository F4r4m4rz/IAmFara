import { Outlet, Route, Routes } from "react-router-dom";
import { useTrackPageView } from "./analytics/useTrackPageView";
import Layout from "./components/layout/Layout";
import Blogs from "./pages/Blogs/Blogs";
import Contact from "./pages/Contact/Contact";
import FinanceApp from "./pages/Finance/FinanceApp";
import RealFinanceApp from "./pages/Finance/RealFinanceApp";
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import SlidingPuzzle from "./pages/SlidingPuzzle/SlidingPuzzle";

function App() {
  useTrackPageView();

  return (
    <Routes>
      {/* Every "real" portfolio page shares the site chrome (nav bar, content
          column) via this layout route. The finance app deliberately sits
          outside it below — it renders its own full-viewport shell with a
          bottom nav, since it should feel like its own phone app (and PWA
          installs shouldn't carry the portfolio's nav bar along with them). */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sliding-puzzle" element={<SlidingPuzzle />} />
      </Route>
      <Route path="/expenses/demo/*" element={<FinanceApp />} />
      <Route path="/expenses/app/*" element={<RealFinanceApp />} />
    </Routes>
  );
}

export default App;
