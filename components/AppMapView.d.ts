import React from 'react';
import { MapViewProps, Region, PROVIDER_DEFAULT as RN_PROVIDER_DEFAULT, Marker as RNMarker } from 'react-native-maps';

export const Marker: typeof RNMarker;
export const PROVIDER_DEFAULT: typeof RN_PROVIDER_DEFAULT;
export type { Region };

export default class MapView extends React.Component<MapViewProps> { }
