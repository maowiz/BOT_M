import { CloudArrowUp } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import showToast from "../../../../../utils/toast";
import System from "../../../../../models/system";
import { useDropzone } from "react-dropzone";
import { v4 } from "uuid";
import FileUploadProgress from "./FileUploadProgress";
import Workspace from "../../../../../models/workspace";
import debounce from "lodash.debounce";

export default function UploadFile({
  workspace,
  fetchKeys,
  setLoading,
  setLoadingMessage,
}) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState([]);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [useAdvanced, setUseAdvanced] = useState(true);
  const [depth, setDepth] = useState(1);
  const [maxPages, setMaxPages] = useState(20);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage(useAdvanced ? "Running Crawl4AI Deep Crawl..." : "Scraping link...");
    setFetchingUrl(true);
    const formEl = e.target;
    const form = new FormData(formEl);

    let result;
    if (useAdvanced) {
      result = await Workspace.uploadLinkAdvanced(
        workspace.slug,
        form.get("link"),
        depth,
        maxPages
      );
    } else {
      result = await Workspace.uploadLink(
        workspace.slug,
        form.get("link")
      );
    }

    const { response, data } = result;
    if (!response.ok) {
      showToast(`Error uploading link: ${data.error}`, "error");
    } else {
      fetchKeys(true);
      showToast("Link uploaded successfully", "success");
      formEl.reset();
      // Reset defaults
      if (useAdvanced) {
        setUseAdvanced(false);
        setDepth(1);
        setMaxPages(20);
      }
    }
    setLoading(false);
    setFetchingUrl(false);
  };

  // Queue all fetchKeys calls through the same debouncer to prevent spamming the server.
  // either a success or error will trigger a fetchKeys call so the UI is not stuck loading.
  const debouncedFetchKeys = debounce(() => fetchKeys(true), 1000);
  const handleUploadSuccess = () => debouncedFetchKeys();
  const handleUploadError = () => debouncedFetchKeys();

  const onDrop = async (acceptedFiles, rejections) => {
    const newAccepted = acceptedFiles.map((file) => {
      return {
        uid: v4(),
        file,
      };
    });
    const newRejected = rejections.map((file) => {
      return {
        uid: v4(),
        file: file.file,
        rejected: true,
        reason: file.errors[0].code,
      };
    });
    setFiles([...newAccepted, ...newRejected]);
  };

  useEffect(() => {
    async function checkProcessorOnline() {
      const online = await System.checkDocumentProcessorOnline();
      setReady(online);
    }
    checkProcessorOnline();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled: !ready,
  });

  return (
    <div>
      <div
        className={`w-[560px] border-dashed border-[2px] border-theme-modal-border light:border-[#686C6F] rounded-2xl bg-theme-bg-primary transition-colors duration-300 p-3 ${ready
          ? " light:bg-[#E0F2FE] cursor-pointer hover:bg-theme-bg-secondary light:hover:bg-transparent"
          : "cursor-not-allowed"
          }`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {ready === false ? (
          <div className="flex flex-col items-center justify-center h-full">
            <CloudArrowUp className="w-8 h-8 text-white/80 light:invert" />
            <div className="text-white text-opacity-80 text-sm font-semibold py-1">
              {t("connectors.upload.processor-offline")}
            </div>
            <div className="text-white text-opacity-60 text-xs font-medium py-1 px-20 text-center">
              {t("connectors.upload.processor-offline-desc")}
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <CloudArrowUp className="w-8 h-8 text-white/80 light:invert" />
            <div className="text-white text-opacity-80 text-sm font-semibold py-1">
              {t("connectors.upload.click-upload")}
            </div>
            <div className="text-white text-opacity-60 text-xs font-medium py-1">
              {t("connectors.upload.file-types")}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 overflow-auto max-h-[180px] p-1 overflow-y-scroll no-scroll">
            {files.map((file) => (
              <FileUploadProgress
                key={file.uid}
                file={file.file}
                uuid={file.uid}
                setFiles={setFiles}
                slug={workspace.slug}
                rejected={file?.rejected}
                reason={file?.reason}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                setLoading={setLoading}
                setLoadingMessage={setLoadingMessage}
              />
            ))}
          </div>
        )}
      </div>
      <div className="text-center text-white text-opacity-50 text-xs font-medium w-[560px] py-2">
        {t("connectors.upload.or-submit-link")}
      </div>
      <form onSubmit={handleSendLink} className="flex flex-col gap-y-2">
        <div className="flex gap-x-2">
          <input
            disabled={fetchingUrl}
            name="link"
            type="url"
            className="border-none disabled:bg-theme-settings-input-bg disabled:text-theme-settings-input-placeholder bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-3/4 p-2.5"
            placeholder={t("connectors.upload.placeholder-link")}
            autoComplete="off"
          />
          <button
            disabled={fetchingUrl}
            type="submit"
            className="disabled:bg-white/20 disabled:text-slate-300 disabled:border-slate-400 disabled:cursor-wait bg bg-transparent hover:bg-slate-200 hover:text-slate-800 w-auto border border-white light:border-theme-modal-border text-sm text-white p-2.5 rounded-lg"
          >
            {fetchingUrl
              ? t("connectors.upload.fetching")
              : t("connectors.upload.fetch-website")}
          </button>
        </div>

        {/* Crawl4AI Advanced Controls */}
        <div className="flex flex-col gap-y-2 pl-1">
          <div className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id="useAdvanced"
              checked={useAdvanced}
              onChange={(e) => setUseAdvanced(e.target.checked)}
              className="cursor-pointer"
            />
            <label htmlFor="useAdvanced" className="text-white text-sm cursor-pointer select-none">
              Use Advanced Crawl (Crawl4AI)
            </label>
          </div>

          {useAdvanced && (
            <div className="flex items-center gap-x-4 pl-6 animate-fade-in-down">
              <div className="flex flex-col gap-y-1">
                <label className="text-white text-xs">Depth</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="bg-theme-settings-input-bg text-white text-sm rounded-lg p-1 w-20 border border-transparent focus:border-primary-button outline-none"
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <label className="text-white text-xs">Max Pages</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="bg-theme-settings-input-bg text-white text-sm rounded-lg p-1 w-20 border border-transparent focus:border-primary-button outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </form>
      <div className="mt-6 text-center text-white text-opacity-80 text-xs font-medium w-[560px]">
        {t("connectors.upload.privacy-notice")}
      </div>
    </div>
  );
}
