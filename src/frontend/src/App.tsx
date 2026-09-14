import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Blogs from "./pages/Blogs/Blogs";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import SlidingPuzzle from "./pages/SlidingPuzzle/SlidingPuzzle";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sliding-puzzle" element={<SlidingPuzzle />} />
      </Routes>
    </Layout>
  );
}

export default App;
