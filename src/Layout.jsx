import { useState } from "react";
import Hero from "./Hero";
import BrandBubbles from "./BrandBubbles";
import FloatingActionButton from "./FloatingActionButton";
import Footer from "./Footer";

function Layout() {
  const [currentSection, setCurrentSection] = useState(null);

  const handleSectionChange = (section) => {
    setCurrentSection(section);
  };

  return (
    <div className="layout-container justify-between">
      <BrandBubbles />
      <main className="layout-main">
        <Hero currentSection={currentSection} setCurrentSection={setCurrentSection} />
      </main>
      <FloatingActionButton />
      <Footer onSectionChange={handleSectionChange} />
    </div>
  );
}

export default Layout;