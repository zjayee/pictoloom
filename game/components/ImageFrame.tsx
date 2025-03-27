import './ImageFrame.css';

const ImageFrame = ({ url }: { url: string }) => {
  return (
    <div className="image-frame__gradient-block">
      <div className="image-frame__image-container">
        <img src={url} alt="Drawing Placeholder" width={294} height={252} />
      </div>
    </div>
  );
};

export default ImageFrame;
