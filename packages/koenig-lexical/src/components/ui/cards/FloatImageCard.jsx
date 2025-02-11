import ImageCard from './ImageCard';

const FloatImageCard = (props) => {
    return (
        // eslint-disable-next-line react/prop-types
        <div className={`kg-image-card kg-float-${props.floatDirection || 'none'}`}>
            <ImageCard {...props} />
        </div>
    );
};

export default FloatImageCard;

