
function Portfolio() {
    const projects = [
        {
            title: "TeeDo",
            description: "Full-Stack Todo App, built solo with AI assist, March 2025",
            technologies: ["React", "Vite", "Tailwind", "Python", "Web Sockets"],
            image: "/TeeDo.png",
            // github: "It's a private repo",
            live: "https://teedo-frontend.vercel.app"
        },
        {
            title: "Awodi Quizzical",
            description: "An interactive quiz app built with React, offering users a fun way to test their knowledge on various topics.",
            technologies: ["React", "CSS"],
            image: "/awodi-quizzical.png",
            github: "https://github.com/Ochiponu-Awodi/Awodi-Quizzical",
            live: "https://awodi-quizzical.netlify.app"
        },
        {
            title: "Tenzies game",
            description: "A digital version of the classic dice game Tenzies, where players race to get all ten of their dice to show the same number .",
            technologies: ["React", "CSS"],
            image: "/scrimba-tenzies.png",
            github: "https://github.com/Ochiponu-Awodi/Tenzies-Game",
            live: "https://scrimba-tenzies-awodi.netlify.app"
        },
        {
            title: "Meme Generator",
            description: "Create custom memes by adding your own text to randomly generated popular meme images.",
            technologies: ["React", "CSS"],
            image: "/meme-gen.png",
            github: "https://github.com/Ochiponu-Awodi/Meme-Generator",
            live: "https://scrimba-meme-generator-awodi.netlify.app/"
        },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 font-karla">My Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="aspect-video mb-3 md:mb-4 overflow-hidden rounded">
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2 font-karla">{project.title}</h3>
                        <p className="text-sm md:text-base mb-2 text-gray-700">{project.description}</p>
                        <p className="text-sm md:text-base mb-3 text-gray-600">
                            <span className="font-semibold">Technologies:</span> {project.technologies.join(", ")}
                        </p>
                        <div className="flex space-x-4">
                            {/* <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-modern-coral hover:text-modern-teal transition-colors duration-300 text-sm md:text-base"
                            >
                                GitHub
                            </a> */}
                            {project.live && (
                                <a 
                                    href={project.live} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-modern-coral hover:text-modern-teal transition-colors duration-300 text-sm md:text-base"
                                >
                                    Live Demo
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Portfolio