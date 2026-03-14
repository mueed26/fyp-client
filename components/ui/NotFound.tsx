interface NotFoundProps {
  message?: string;
}

export function NotFound({ message = "Not found" }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-gray-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
        </div>
        {message}
      </div>
    </div>
  );
}
