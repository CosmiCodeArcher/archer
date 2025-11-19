import { useState } from "react";
import Hero from "./Hero";
import BrandBubbles from "./BrandBubbles";
import FloatingActionButton from "./FloatingActionButton";
import Footer from "./Footer";

function Layout() {
  const [currentSection, setCurrentSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleSectionChange = (section) => {
    setCurrentSection(section);
  };

  return (
    <div className="layout-container justify-between">
      <BrandBubbles toggleModal={toggleModal} />
      <main className="layout-main">
        <Hero currentSection={currentSection} setCurrentSection={setCurrentSection} isModalOpen={isModalOpen} toggleModal={toggleModal} />
      </main>
      <FloatingActionButton />
      <Footer onSectionChange={handleSectionChange} />
    </div>
  );
}

export default Layout;