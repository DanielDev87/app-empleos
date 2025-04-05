import { DefaultTheme } from "@react-navigation/native";
import colors from "./colors";

const CusthomTheme = {
    ...DefaultTheme,
    colors:{
        ...DefaultTheme.colors,
        background: colors.gradientePrimario,
        card: colors.variante6,
        text: colors.default,
        borde: colors.thin,
        notification: colors.exito

    }
}

export default CusthomTheme;