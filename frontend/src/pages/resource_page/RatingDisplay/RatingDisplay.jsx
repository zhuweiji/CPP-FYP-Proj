import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

import s from "./style.module.css";

function RatingDisplay(props) {
  const { rating } = props;

  const starList = [];
  const flooredRating = Math.floor(rating);
  const fullStars = flooredRating;
  const halfStar = rating - flooredRating >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    starList.push(<StarIcon key={`fullstar-${i}`} />);
  }

  if (halfStar) {
    starList.push(<StarHalfIcon key={`halfstar`} />);
  }

  for (let i = starList.length; i < 5; i++) {
    starList.push(<StarOutlineIcon key={`emptystar-${i}`} />);
  }

  return (
    <div>
      <h2 className={`${s.rating}`}>{`Rating: ${rating.toFixed(1)} / 5`}</h2>
      {starList}
    </div>
  );
}

export default RatingDisplay;
