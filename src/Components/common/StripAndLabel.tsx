import {Platform, View} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {getTopAndLeftForStripAndLabel, StripAndLabelProps} from 'gifted-charts-core';

export const StripAndLabel = (
    props: StripAndLabelProps & { svgHeight: number }
) => {
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
        containerHeight,
    } = props;

    const {top, left} = getTopAndLeftForStripAndLabel(props);
    if (isNaN(top)) return null;


    const isWeb = Platform.OS === 'web';
    const chartH = (containerHeight ?? 0);
    const axisH  = (xAxisThickness ?? 0);

    // Hauteur svg
    const h = isWeb ? chartH + axisH
        : Math.round((svgHeight ?? 0) || (chartH + axisH));

    // Helpers de snap (netteté) :
    const isOdd = (n: number) => Math.round(n) % 2 === 1;
    const snapY = (y: number, strokeW: number) =>
        isWeb && isOdd(strokeW) ? y - 0.5 : y;
    const snapX = (x: number, strokeW: number) =>
        isWeb && isOdd(strokeW) ? x - 0.5 : x;

    // Centre EXACT de l’axe X (aligne-toi sur la parité de l’axe, pas de la barre)
    const axisCenterY = snapY(chartH + axisH / 2, axisH);

    // Départ si pas "upto datapoint"
    const y1Base = Math.max(0, axisCenterY - (pointerStripHeight ?? 0));

    // X de la barre (snap pour netteté selon la parité de la barre)
    const lineX = snapX(
        pointerX + pointerRadius + 2 + (pointerItemLocal[0]?.pointerShiftX || 0),
        pointerStripWidth
    );

    return (
        <View style={{position: 'absolute', top: pointerYLocal}}>
            {(isBarChart ? showPointerStrip && !pointerLabelComponent : showPointerStrip) ? (
                <View
                    style={{
                        position: 'absolute',
                        left: -pointerStripWidth / 4,
                        top: containsNegative ? 0 : -pointerYLocal,
                        width,
                        height: h, // <= identique au SVG juste dessous
                    }}
                >
                    {/* IMPORTANT: même hauteur que le conteneur ci-dessus */}
                    <Svg height={h} width={width}>
                        <Line
                            stroke={pointerStripColor}
                            strokeWidth={pointerStripWidth}
                            strokeDasharray={pointerConfig?.strokeDashArray || ''}
                            x1={lineX}
                            y1={pointerStripUptoDataPoint ? pointerYLocal + pointerRadius - 4 : y1Base}
                            x2={lineX}
                            y2={axisCenterY}
                            strokeLinecap="butt"
                        />
                        {horizontalStripConfig && (
                            <Line
                                stroke={horizontalStripConfig.color ?? pointerStripColor}
                                strokeWidth={horizontalStripConfig.thickness ?? pointerStripWidth}
                                strokeDasharray={
                                    (pointerConfig?.horizontalStripConfig?.strokeDashArray ??
                                        pointerConfig?.strokeDashArray) ? pointerConfig?.strokeDashArray : ''
                                }
                                x1={0}
                                y1={pointerYLocal - 7}
                                x2={
                                    horizontalStripConfig.horizontalStripUptoDataPoint
                                        ? pointerX + 2
                                        : screenWidth
                                }
                                y2={pointerYLocal - 7}
                            />
                        )}
                    </Svg>

                    {horizontalStripConfig?.labelComponent ? (
                        <View
                            pointerEvents={pointerEvents ?? 'none'}
                            style={{
                                position: 'absolute',
                                left: 0,
                                top:
                                    pointerYLocal -
                                    3 -
                                    (horizontalStripConfig.labelComponentHeight ?? 30) / 2,
                                width: pointerLabelWidth,
                            }}
                        >
                            {horizontalStripConfig.labelComponent(
                                hasDataSet ? pointerItemsForSet : pointerItemLocal,
                                hasDataSet ? secondaryPointerItemsForSet : [secondaryPointerItem],
                                pointerIndex
                            )}
                        </View>
                    ) : null}
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
