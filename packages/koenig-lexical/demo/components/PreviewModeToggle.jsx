import EditIcon from './icons/post-edit.svg?react';
import PreviewIcon from './icons/post-preview.svg?react';

const PreviewModeToggle = ({previewMode, togglePreviewMode}) => {
    return (
        <>
            <button className="absolute right-32 top-4 z-20 block h-[22px] w-[42px] cursor-pointer rounded-full transition-all ease-in-out" type="button" onClick={togglePreviewMode}>
                {previewMode ? 
                    (<EditIcon className="absolute left-[6px] top-[5px] size-5 text-slate-800" />) 
                    : (<PreviewIcon className="absolute left-[6px] top-[5px] size-5 text-blue-800" />)}
            </button>
        </>
    );
};

export default PreviewModeToggle;
