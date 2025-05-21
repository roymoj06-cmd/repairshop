import SettingsIcon from "@mui/icons-material/Settings";
import { Box, CircularProgress } from "@mui/material";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { FC } from "react";

const spinForward = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const spinReverse = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
`;
const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;
const OuterCircleWrapper = styled.div`
  position: relative;
  display: inline-flex;
  animation: ${spinForward} 2s linear infinite;
`;
const InnerCircleWrapper = styled.div`
  position: absolute;
  display: inline-flex;
  animation: ${spinReverse} 2s linear infinite;
`;
const CenteredIcon = styled(SettingsIcon)`
  position: absolute;
  font-size: 40px;
  color: #333;
  animation: ${pulseAnimation} 2s ease-in-out infinite;
`;

const Loading: FC = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,240,0.95))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.1))",
        }}
      >
        <OuterCircleWrapper>
          <CircularProgress
            size={100}
            thickness={2}
            variant="determinate"
            value={70}
            sx={{ color: "primary.main", opacity: 0.8 }}
          />
        </OuterCircleWrapper>
        <InnerCircleWrapper>
          <CircularProgress
            size={80}
            thickness={3}
            variant="determinate"
            value={75}
            sx={{ color: "secondary.main" }}
          />
        </InnerCircleWrapper>

        <CenteredIcon />
      </Box>
    </Box>
  );
};

export default Loading;
