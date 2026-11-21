import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CeramicsApi, type CeramicCategory, type CeramicImage as StoredImage, type CeramicProduct } from "@/api/CeramicsController";
import { toApiError, type ApiFieldErrors } from "@/api/_axios-client";
import CeramicImage from "@/components/ceramics/CeramicImage";
import BilingualSaveWarning from "@/components/admin/BilingualSaveWarning";
import ContentLanguageSwitch, { type ContentLanguage } from "@/components/admin/ContentLanguageSwitch";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useBilingualSaveGuard } from "@/components/admin/useBilingualSaveGuard";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import { validateImageFile } from "@/lib/form-validation";
import { action, danger, input, panel, primary } from "./styles";

type ImageDraft = {
  key: string;
  saved?: StoredImage;
  url?: string;
  file?: File;
};

function ImagePreview({ image }: { image: ImageDraft }) {
  const [preview, setPreview] = useState<string>();
  useEffect(() => {
    if (!image.file) return;
    const url = URL.createObjectURL(image.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image.file]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
      <CeramicImage url={image.file ? preview : image.url} alt="" sizes="(min-width: 640px) 180px, 45vw" />
    </div>
  );
}

export default function CeramicProductEditor({ product, categories, requestBusy, onDirtyChange, onSavingChange, onSaved, onPartialSave, onClose }: {
  product?: CeramicProduct;
  categories: CeramicCategory[];
  requestBusy: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
  onPartialSave: () => void;
  onClose: () => void;
}) {
  const [productId, setProductId] = useState(product?.id);
  const [language, setLanguage] = useState<ContentLanguage>("el");
  const [text, setText] = useState({
    title: product?.title ?? "",
    titleEn: product?.titleEn ?? "",
    description: product?.description ?? "",
    descriptionEn: product?.descriptionEn ?? "",
  });
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [categoryId, setCategoryId] = useState(product ? String(product.category.id) : "");
  const [images, setImages] = useState<ImageDraft[]>(() => (product?.images ?? []).map((image) => ({
    key: String(image.id), saved: image, url: image.imageUrl,
  })));
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [imageOrderChanged, setImageOrderChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const nextFileKey = useRef(0);
  const editor = useRef<HTMLElement>(null);
  const errors = useFormErrors();
  const saveGuard = useBilingualSaveGuard(setLanguage);
  const titleField = language === "el" ? "title" : "titleEn";
  const descriptionField = language === "el" ? "description" : "descriptionEn";
  const originalImages = product?.images;
  const dirty = text.title !== (product?.title ?? "")
    || text.titleEn !== (product?.titleEn ?? "")
    || text.description !== (product?.description ?? "")
    || text.descriptionEn !== (product?.descriptionEn ?? "")
    || price !== (product ? String(product.price) : "")
    || categoryId !== (product ? String(product.category.id) : "")
    || images.length !== (originalImages?.length ?? 0)
    || images.some((image, index) => image.key !== String(originalImages?.[index]?.id));

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    editor.current?.scrollIntoView({ block: "start" });
    editor.current?.focus({ preventScroll: true });
  }, []);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validation: ApiFieldErrors = {};
    const additions: ImageDraft[] = [];

    for (const file of files) {
      const fileErrors: ApiFieldErrors = {};
      validateImageFile(file, "images", fileErrors);
      if (fileErrors.images) {
        validation.images ??= [];
        validation.images.push(...fileErrors.images.map((message) => `${file.name}: ${message}`));
      } else {
        additions.push({ key: `file-${nextFileKey.current++}`, file });
      }
    }

    event.target.value = "";
    errors.setFieldErrors((current) => ({ ...current, images: validation.images ?? [] }));
    setImages((current) => [...current, ...additions]);
    if (additions.length > 0) setImageOrderChanged(true);
  }

  function moveImage(from: number, to: number) {
    setImageOrderChanged(true);
    setImages((current) => {
      const next = [...current];
      const [image] = next.splice(from, 1);
      next.splice(to, 0, image);
      return next;
    });
  }

  function removeImage(image: ImageDraft) {
    setImageOrderChanged(true);
    if (image.saved) {
      const id = image.saved.id;
      setRemovedIds((current) => [...current, id]);
    }
    setImages((current) => current.filter((item) => item.key !== image.key));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (saving.current || requestBusy) return;
    const validation: ApiFieldErrors = {};
    const normalizedPrice = price.trim().replace(",", ".");
    if (!text.title.trim()) validation.title = ["Συμπληρώστε τον τίτλο."];
    if (!text.description.trim()) validation.description = ["Συμπληρώστε την περιγραφή."];
    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(normalizedPrice)) {
      validation.price = ["Δώστε μη αρνητική τιμή με έως δύο δεκαδικά ψηφία."];
    }
    if (!categories.some((category) => String(category.id) === categoryId)) {
      validation.categoryId = ["Επιλέξτε κατηγορία."];
    }
    if (!errors.applyFrontendErrors(validation)) {
      if (validation.title || validation.description) setLanguage("el");
      return;
    }
    saveGuard.requestSave([text.title, text.description], [text.titleEn, text.descriptionEn], () => save(normalizedPrice));
  }

  async function save(normalizedPrice: string) {
    if (saving.current) return;
    saving.current = true;
    onSavingChange(true);
    setBusy(true);
    let productSaved = false;
    try {
      const values = {
        title: text.title.trim(), titleEn: text.titleEn.trim(),
        description: text.description.trim(), descriptionEn: text.descriptionEn.trim(),
        price: Number(normalizedPrice), categoryId: Number(categoryId),
      };
      let id = productId;
      if (id === undefined) {
        id = (await CeramicsApi.createProduct(values)).id;
        setProductId(id);
      } else {
        await CeramicsApi.updateProduct(id, values);
      }
      productSaved = true;

      // Keep each completed step in the draft so a retry resumes after a partial save.
      for (const [sortOrder, image] of images.entries()) {
        let url = image.url;
        if (image.file) {
          url = await CeramicsApi.uploadImage(image.file);
          setImages((current) => current.map((item) => item.key === image.key ? { ...item, url, file: undefined } : item));
        }
        if (url === undefined) continue;

        const payload = { imageUrl: url, sortOrder };
        let saved = image.saved;
        if (!saved) {
          saved = await CeramicsApi.addImage(id, payload);
        } else if (imageOrderChanged && saved.sortOrder !== sortOrder) {
          await CeramicsApi.updateImage(id, saved.id, payload);
          saved = { ...saved, sortOrder };
        }
        setImages((current) => current.map((item) => item.key === image.key ? { ...item, saved } : item));
      }

      for (const imageId of removedIds) {
        try {
          await CeramicsApi.removeImage(id, imageId);
        } catch (error) {
          if (toApiError(error).status !== 404) throw error;
        }
        setRemovedIds((current) => current.filter((item) => item !== imageId));
      }
      onSaved();
    } catch (error) {
      if (productSaved) {
        onPartialSave();
        const parsed = toApiError(error);
        const details = [parsed.message, ...Object.values(parsed.fieldErrors).flat()].join("\n");
        errors.showGeneralError(`Τα στοιχεία του προϊόντος αποθηκεύτηκαν. Δοκιμάστε ξανά για να ολοκληρωθούν οι αλλαγές στις εικόνες.\n${details}`);
      } else {
        const parsed = errors.applyApiError(error);
        if (parsed.fieldErrors.titleEn || parsed.fieldErrors.descriptionEn) setLanguage("en");
        else if (parsed.fieldErrors.title || parsed.fieldErrors.description) setLanguage("el");
      }
    } finally {
      saving.current = false;
      onSavingChange(false);
      setBusy(false);
    }
  }

  return (
    <section ref={editor} tabIndex={-1} data-bilingual-form className={`${panel} scroll-mt-36`} aria-labelledby="ceramic-editor-title">
      <h2 id="ceramic-editor-title" className="mb-4 break-words text-xl font-semibold">
        {productId ? `Επεξεργασία προϊόντος: ${product?.title ?? text.title}` : "Νέο προϊόν"}
      </h2>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={busy || requestBusy} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ContentLanguageSwitch value={language} onChange={setLanguage} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              {language === "el" ? "Τίτλος" : "Title"}
              <input className={input} required={language === "el"} maxLength={255} value={text[titleField]} onChange={(event) => {
                setText((current) => ({ ...current, [titleField]: event.target.value }));
                errors.clearFieldError(titleField);
              }} />
            </label>
            <FormFieldError errors={errors.fieldErrors[titleField]} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              {language === "el" ? "Περιγραφή" : "Description"}
              <textarea className={input} required={language === "el"} rows={5} maxLength={10000} value={text[descriptionField]} onChange={(event) => {
                setText((current) => ({ ...current, [descriptionField]: event.target.value }));
                errors.clearFieldError(descriptionField);
              }} />
            </label>
            <FormFieldError errors={errors.fieldErrors[descriptionField]} />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Τιμή (EUR)
              <input className={input} required inputMode="decimal" value={price} onChange={(event) => { setPrice(event.target.value); errors.clearFieldError("price"); }} />
            </label>
            <FormFieldError errors={errors.fieldErrors.price} />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Κατηγορία
              <select className={input} required value={categoryId} onChange={(event) => { setCategoryId(event.target.value); errors.clearFieldError("categoryId"); }}>
                <option value="">Επιλέξτε κατηγορία</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <FormFieldError errors={errors.fieldErrors.categoryId} />
          </div>
          <div className="space-y-3 sm:col-span-2">
            <label className="block text-sm font-medium">
              Εικόνες προϊόντος
              <input className={`${input} mt-1`} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectFiles} />
            </label>
            <FormFieldError errors={errors.fieldErrors.images} />
            {images.length === 0 && (
              <div className="relative h-24 w-24 overflow-hidden rounded-xl">
                <CeramicImage alt="" sizes="96px" />
              </div>
            )}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <li key={image.key} className="min-w-0 space-y-2 rounded-xl border border-slate-200 p-2">
                  <ImagePreview image={image} />
                  <p className="text-sm font-medium">{index === 0 ? "Κύρια εικόνα" : `Εικόνα ${index + 1}`}</p>
                  <div className="flex flex-wrap gap-1">
                    <button className={action} type="button" aria-label={`Μετακίνηση εικόνας ${index + 1} νωρίτερα`} disabled={index === 0} onClick={() => moveImage(index, index - 1)}>↑</button>
                    <button className={action} type="button" aria-label={`Μετακίνηση εικόνας ${index + 1} αργότερα`} disabled={index === images.length - 1} onClick={() => moveImage(index, index + 1)}>↓</button>
                    {index > 0 && <button className={action} type="button" onClick={() => moveImage(index, 0)}>Ορισμός κύριας</button>}
                    <button className={danger} type="button" onClick={() => removeImage(image)}>Αφαίρεση</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className={primary} type="submit">{busy ? "Αποθήκευση…" : "Αποθήκευση"}</button>
            <button className={action} type="button" onClick={onClose}>Ακύρωση</button>
          </div>
        </fieldset>
      </form>
      <BilingualSaveWarning {...saveGuard.warningProps} />
      <GeneralErrorDialog open={!!errors.generalError} title={errors.generalError?.title} message={errors.generalError?.message ?? ""} onClose={errors.closeGeneralError} />
    </section>
  );
}
