import { Upload } from "lucide-react";
import { useRef } from "react";
import { useLocale } from "../../../i18n";
import { BuiltInImage } from "../engine/puzzleTypes";
import { ACCEPTED_UPLOAD_TYPES } from "../images/imageLoading";

type ImagePickerProps = {
  images: readonly BuiltInImage[];
  selectedId: string | null;
  onSelectBuiltIn: (image: BuiltInImage) => void;
  onSelectFile: (file: File) => void;
};

export function ImagePicker({ images, selectedId, onSelectBuiltIn, onSelectFile }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocale();

  return (
    <div role="group" aria-label={t("puzzle.imagePicker.groupLabel")} className="flex flex-wrap gap-3">
      {images.map((img) => (
        <button
          key={img.id}
          type="button"
          onClick={() => onSelectBuiltIn(img)}
          aria-pressed={selectedId === img.id}
          aria-label={img.label}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-term-green ${
            selectedId === img.id ? "border-term-green" : "border-term-border hover:border-term-green/60"
          }`}
        >
          <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" />
        </button>
      ))}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-pressed={selectedId === "upload"}
        aria-label={t("puzzle.imagePicker.uploadAria")}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-term-muted transition-colors focus:outline-none focus:ring-2 focus:ring-term-green ${
          selectedId === "upload"
            ? "border-term-green text-term-green"
            : "border-term-border hover:border-term-green/60 hover:text-term-green"
        }`}
      >
        <Upload className="h-5 w-5" aria-hidden="true" />
        <span className="text-[10px]">{t("puzzle.imagePicker.upload")}</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_UPLOAD_TYPES.join(",")}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // allow re-selecting the same file consecutively
          if (file) onSelectFile(file);
        }}
      />
    </div>
  );
}
