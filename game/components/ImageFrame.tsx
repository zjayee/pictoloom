import './ImageFrame.css';

type ImageFrameProps = {
  url: string;
  blur?: boolean;
};

const ImageFrame = ({ url, blur = false }: ImageFrameProps) => {
  return (
    <div className="image-frame__gradient-block">
      <div className="image-frame__image-container overflow-hidden">
        <img
          src={url}
          alt="Drawing Placeholder"
          width={294}
          height={252}
          className={blur ? 'blur-sm' : ''}
        />
      </div>
    </div>
  );
};

export default ImageFrame;
