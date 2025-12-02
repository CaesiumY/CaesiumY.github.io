export default function PdfDownloadButton() {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "윤창식_Resume";
    window.print();
    document.title = originalTitle;
  };

  return (
    <button
      onClick={handlePrint}
      aria-label="이력서 인쇄/PDF 저장"
      title="이력서 인쇄/PDF 저장"
      className="fixed bottom-6 right-6 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent text-background shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-2 focus:outline-offset-2 focus:outline-accent print:hidden sm:bottom-8 sm:right-8"
    >
      <svg
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
    </button>
  );
}
