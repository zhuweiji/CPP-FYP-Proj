import { useCapitalizer } from "../../../hooks/capitalize-hook";
import s from "./style.module.css";

function EmptyResource(props) {
  const { resourceType } = props;
  const { capitalizeWords } = useCapitalizer();

  return (
    <div className={`${s.main_container}`}>
      <h1 className={`${s.title}`}>{`No ${capitalizeWords(
        resourceType
      )} Found`}</h1>
      <p
        className={`${s.message}`}
      >{`There are currently no ${resourceType} available. Come back in the near future!`}</p>
    </div>
  );
}

export default EmptyResource;
