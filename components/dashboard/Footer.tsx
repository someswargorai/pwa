export default function Footer() {
  return (
    <footer className="relative z-10 w-full max-w-2xl lg:max-w-full mx-auto px-5 lg:px-10 py-8 mt-4 mb-24 flex flex-col items-center justify-center text-center">
      <div className="w-full h-[1px] bg-gray-200/50 mb-6 rounded-full"></div>
      <h2 className="text-[16px] font-bold text-gray-900 mb-1">Nexus</h2>
      <p className="text-[13px] font-medium text-gray-500 mb-4">Premium Note-Taking Experience</p>
      
      <div className="flex items-center gap-4 text-[13px] font-semibold text-gray-400">
        <a href="#" className="hover:text-brand-blue transition-colors">Privacy</a>
        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
        <a href="#" className="hover:text-brand-blue transition-colors">Terms</a>
        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
        <a href="#" className="hover:text-brand-blue transition-colors">Contact</a>
      </div>
      
      <p className="text-[12px] font-medium text-gray-400 mt-6">&copy; {new Date().getFullYear()} Nexus. All rights reserved.</p>
    </footer>
  );
}
