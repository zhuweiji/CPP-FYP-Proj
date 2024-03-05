import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DuoIcon from "@mui/icons-material/Duo";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArrowLeftOutlinedIcon from "@mui/icons-material/ArrowLeftOutlined";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";

import s from "./style.module.css";

const resources = ["Notes", "Videos", "Exams", "Contribute"];

function SideBar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // const toggleDrawer = (open) => (event) => {
  //   if (
  //     event.type === "keydown" &&
  //     (event.key === "Tab" || event.key === "Shift")
  //   ) {
  //     return;
  //   }

  //   setIsCollapsed(open);
  // };

  const icons = [
    <MenuBookIcon />,
    <DuoIcon />,
    <EditNoteIcon />,
    <DriveFolderUploadIcon />,
  ];

  function handleClick() {
    setIsCollapsed((prev) => !prev);
  }

  const items = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      // onClick={() => toggleDrawer(false)}
      // onKeyDown={() => toggleDrawer(false)}
    >
      <List>
        {resources.map((text, idx) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(`./../${text.toLowerCase()}`);
              }}
            >
              <ListItemIcon>{icons[idx]}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {!isCollapsed && <div className={`${s.container}`}>{items()}</div>}
      <div
        className={`${s.btn_container} ${
          isCollapsed ? s.btn_collapsed : s.btn_expand
        }`}
        onClick={handleClick}
      >
        {isCollapsed ? (
          <ArrowRightOutlinedIcon fontSize="large" />
        ) : (
          <ArrowLeftOutlinedIcon fontSize="large" />
        )}
      </div>
    </>
  );
}

export default SideBar;
