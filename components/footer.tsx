export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-sm border-t border-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Gas Optimizer. All rights reserved.</p>
      </div>
    </footer>
  );
}
