import { Outlet, Route, Routes } from "react-router-dom";
import { useTrackPageView } from "./analytics/useTrackPageView";
import Layout from "./components/layout/Layout";
import DetectiveGame from "./pages/Detective/DetectiveGame";
import Blogs from "./pages/Blogs/Blogs";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import SlidingPuzzle from "./pages/SlidingPuzzle/SlidingPuzzle";

function App() {
  useTrackPageView();

  return (
    <Routes>
      {/* Every "real" portfolio page shares the site chrome (nav bar, content
          column) via this layout route. The detective game deliberately sits
          outside it below — it renders its own full-viewport shell, since
          the portfolio nav bar above a fake desktop would undercut the
          "you are now sitting at a different computer" framing. */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sliding-puzzle" element={<SlidingPuzzle />} />
      </Route>
      <Route path="/detective/*" element={<DetectiveGame />} />
    </Routes>
  );
}

export default App;
