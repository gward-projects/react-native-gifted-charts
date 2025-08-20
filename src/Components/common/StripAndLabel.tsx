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

    // ---- Offsets: on fige UNE FOIS, puis on réutilise exactement la même valeur
    const outerTop = snapGrid(pointerYLocal);
    const innerTop = -outerTop;

    // ---- Ligne verticale: X/Y verrouillés
    const lineX = snapGrid(
        pointerX + pointerRadius + 2 + (pointerItemLocal[0]?.pointerShiftX || 0)
    );

    // Si l’axe est un RECT (Web) vise son bas; sinon vise le centre depuis le bas du SVG (Native)
    // Nudge Web: demi-pixel si épaisseur impaire (axe + barre) + 1px (rect de l’axe)
    const isOdd = (n: number) => Math.round(n) % 2 === 1;
    //@ts-ignore
    const extraWebOffset = isWeb ? (pointerConfig?.extraWebOffset ?? 1) : 0;
    const webNudge = isWeb
        ? (isOdd(axisH) ? 0.5 : 0) + (isOdd(pointerStripWidth) ? 0.5 : 0) + extraWebOffset
        : 0;

    // IMPORTANT: on agrandit la hauteur du SVG de l’offset Web (sinon la barre est clipée)
    const drawHeight = isWeb
        ? snapGrid(chartH + axisH + extraWebOffset)
        : Math.round((svgHeight ?? 0) || (chartH + axisH));

    // Web: bas du rect de l’axe + nudge ; Native: centre depuis le bas
    const y2 = isWeb
        ? snapGrid(chartH + axisH + extraWebOffset)
        : snapGrid(drawHeight - axisH / 2);

    // Départ si pas "upto datapoint"
    const y1Base = Math.max(0, y2 - (pointerStripHeight ?? 0));

    // Option netteté (évite l’épaississement au zoom)
    const commonProps = {vectorEffect: 'non-scaling-stroke' as const};

    return (
        <View style={{position: 'absolute', top: outerTop}}>
            {(isBarChart ? showPointerStrip && !pointerLabelComponent : showPointerStrip) ? (
                <View
                    style={{
                        position: 'absolute',
                        left: -pointerStripWidth / 4,
                        top: containsNegative ? 0 : innerTop,     // <= plus jamais -pointerYLocal direct
                        width,
                        height: drawHeight,
                        overflow: 'visible',
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
