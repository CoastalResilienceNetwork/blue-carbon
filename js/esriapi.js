define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang",
	"esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, lang,
			IdentifyTask, IdentifyParameters) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:1});
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.setVisibleLayers([-1]);
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					// Trigger click on map layers inputs
					var ar = [];
					ar.push.apply(ar, t.obj.visibleLayers);
					$.each(ar,function(i,v){
						$("#" + t.id + "cmc input[value='" + v + "']").trigger("click");
					})
					// Trigger click on view stats on button
					$("#" + t.id + "viewStatsOnToggle input[value='" + t.obj.viewStatsOn + "']").trigger("click")
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}	
				});
				t.sym1  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([88,116,215,1]), 1), new Color([88,116,215]);
				t.sym2  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([44,123,182]), 1), new Color([44,123,182]);

				// Query all features 
				var q = new Query();
				var qt = new QueryTask(t.url + "/0" );
				q.where = "OBJECTID > -1";
				q.returnGeometry =false;
				q.outFields = ["*"];
				t.atts = [];
				qt.execute(q, function(e){
					t.features = e.features;
					$.each(e.features,function(i,v){
						var c =v.attributes.CNTRY_NAME;
						if (c != "Global"){
							$("#" + t.id + "countrySelect").append("<option value='"+c+"'>"+c+"</option>")
						}
					})			
					$("#" + t.id + "countrySelect").trigger("chosen:updated");
				});	
				t.map.setMapCursor("pointer");
			},
			clearAtts: function(t){
				t.map.graphics.clear();
			} 				
		});
    }
);