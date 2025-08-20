import {PixelRatio, Platform, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {getTopAndLeftForStripAndLabel, StripAndLabelProps,} from 'gifted-charts-core';

export const StripAndLabel = (props: StripAndLabelProps & { svgHeight: number }) => {
    const {
        pointerX,
        pointerLabelWidth,
        pointerRadius,
        pointerWidth,
        pointerYLocal,
        pointerStripUptoDataPoint,
        pointerStripHeight,
        pointerItemLocal,
        showPointerStrip,
        pointerStripWidth,
        xAxisThickness,
        pointerStripColor,
        pointerConfig,
        pointerLabelComponent,
        secondaryPointerItem,
        pointerItemsForSet,
        secondaryPointerItemsForSet,
        pointerEvents,
        isBarChart,
        pointerIndex,
        hasDataSet,
        containsNegative,
        horizontalStripConfig,
        screenWidth,
        width,
        svgHeight,
        containerHeight
    } = props;

    const {top, left} = getTopAndLeftForStripAndLabel(props);

    if (isNaN(top)) return null;


    const dpr = PixelRatio.get();               // = window.devicePixelRatio sur Web
    const snapGrid = (v: number) => Math.round(v * dpr) / dpr; // verrouille à la grille DPR

    // ---- Dimensions
    const isWeb = Platform.OS === 'web';
    const chartH = (containerHeight ?? 0);
    const axisH = (xAxisThickness ?? 0);

    // IMPORTANT: fige h et width sur la grille aussi
    const drawHeight = isWeb
        ? Math.round(chartH + axisH)
        : Math.round((svgHeight ?? 0) || (chartH + axisH));

    // ---- Offsets: on fige UNE FOIS, puis on réutilise exactement la même valeur
    const outerTop = snapGrid(pointerYLocal);
    const innerTop = -outerTop;

    // ---- Ligne verticale: X/Y verrouillés
    const lineX = snapGrid(
        pointerX + pointerRadius + 2 + (pointerItemLocal[0]?.pointerShiftX || 0)
    );

    // Si l’axe est un RECT (Web) vise son bas; sinon vise le centre depuis le bas du SVG (Native)
    const y2 = isWeb ? snapGrid(chartH + axisH) : snapGrid(drawHeight - axisH / 2);

    // Départ si pas "upto datapoint"
    const y1Base = Math.max(0, y2 - (pointerStripHeight ?? 0));

    // Option netteté (évite l’épaississement au zoom)
    const commonProps = {vectorEffect: 'non-scaling-stroke' as const};

    return (
        <View style={{ position: 'absolute', top: outerTop }}>
            {(isBarChart ? showPointerStrip && !pointerLabelComponent : showPointerStrip) ? (
                <View
                    style={{
                        position: 'absolute',
                        left: -pointerStripWidth / 4,
                        top: containsNegative ? 0 : innerTop,     // <= plus jamais -pointerYLocal direct
                        width,
                        height: drawHeight,
                    }}
                >
                    <Svg height={drawHeight} width={width}>
                        <Line
                            {...commonProps}
                            stroke={pointerStripColor}
                            strokeWidth={pointerStripWidth}
                            strokeDasharray={pointerConfig?.strokeDashArray || ''}
                            x1={lineX}
                            y1={pointerStripUptoDataPoint ? snapGrid(pointerYLocal + pointerRadius - 4) : y1Base}
                            x2={lineX}
                            y2={y2}
                            strokeLinecap="butt"
                        />
                        {horizontalStripConfig && (
                            <Line
                                {...commonProps}
                                stroke={horizontalStripConfig.color ?? pointerStripColor}
                                strokeWidth={horizontalStripConfig.thickness ?? pointerStripWidth}
                                strokeDasharray={
                                    (pointerConfig?.horizontalStripConfig?.strokeDashArray ??
                                        pointerConfig?.strokeDashArray) ? pointerConfig?.strokeDashArray : ''
                                }
                                x1={0}
                                y1={snapGrid(pointerYLocal - 7)}
                                x2={horizontalStripConfig.horizontalStripUptoDataPoint ? pointerX + 2 : screenWidth}
                                y2={snapGrid(pointerYLocal - 7)}
                            />
                        )}
                    </Svg>
                    {/* ... */}
                </View>
            ) : null}

            {pointerLabelComponent ? (
                <View
                    pointerEvents={pointerEvents ?? 'none'}
                    style={{
                        position: 'absolute',
                        left: left + pointerX,
                        top,
                        marginTop: pointerStripUptoDataPoint ? 0 : y1Base,
                        width: pointerLabelWidth,
                    }}
                >
                    {pointerLabelComponent(
                        hasDataSet ? pointerItemsForSet : pointerItemLocal,
                        hasDataSet ? secondaryPointerItemsForSet : [secondaryPointerItem],
                        pointerIndex
                    )}
                </View>
            ) : null}
        </View>
    );
};
