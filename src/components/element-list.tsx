import { Link } from "react-router-dom";
import Dashboard from "../domain/dashboard";
import Widget from "../domain/widget";
import { formatDate } from "../utils";

type Props = {
  title: string;
  elements: Widget[] | Dashboard[];
  type: "widget" | "dashboard";
};

function ElementList(props: Props) {
  const { title, elements, type } = props;

  return (
    <div className="element-list">
      <div className="element-list-title">{title}</div>

      {elements.length === 0 && (
        <div className="element-list-items p-4">No items found</div>
      )}

      {elements.length > 0 && (
        <div className="element-list-items">
          {elements.map((element) => {
            let url = "";
            if (type === "widget") {
              url = "/widgets/" + element.id;
            }
            if (type === "dashboard") {
              console.log(element);
              url =
                "/dashboards/" +
                element.user?.username +
                ":" +
                (element as Dashboard).slug;
            }

            return (
              <Link
                to={url}
                className="element-list-item div-link"
                key={element.id}
              >
                <div className="element-list-item-title">{element.title}</div>

                <div className="element-list-item-info">
                  {element.user && (
                    <span>Created by @{element.user!.username}</span>
                  )}
                  <span className="ml-2">
                    on {formatDate(element.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ElementList;
