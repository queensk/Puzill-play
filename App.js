// import React and React Native libraries
import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import PixelApi from "pixel-api"; // import this package
import ImageCropper from "react-native-image-crop-picker"; // import this package
import { isEqual } from "lodash"; // import this package

// define the main app component
export default function App() {
  const pixelApi = new PixelApi({
    apiKey: "zDzD1svbZRtKzs1ZZ7psX4U9J8aR15TEiowL2qtfExy2QYlQnsSu5UdZ", // create an instance of PixelApi
  });
  const [gridItems, setGridItems] = useState([]); // create a state for grid items
  const [originalItems, setOriginalItems] = useState([]); // create a state for original order
  const [emptyIndex, setEmptyIndex] = useState(0); // create a state for empty index

  useEffect(() => {
    loadNewGame(); // load a new game when mounting
  }, []);

  async function loadNewGame() {
    const photos = await pixelApi.getPhotos(); // get photos from pixel api
    const photo = photos[0]; // get the first photo
    const file = await photo.download(); // download the photo as a file
    const croppedFiles = await cropImage(file); // crop the image into nine parts
    setGridItems(croppedFiles.sort(() => Math.random() - 0.5)); // shuffle the grid items
    setOriginalItems([...croppedFiles]); // copy the original order
    setEmptyIndex(Math.floor(Math.random() * 9)); // generate a random empty index
  }

  async function cropImage(file) {
    const files = [];
    const image = await file.readAsBytes(); // read image bytes
    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * (image.width / 3); // calculate x coordinate
      const y = Math.floor(i / 3) * (image.height / 3); // calculate y coordinate
      const croppedFile = await ImageCropper.openCropper({
        // crop the image using ImageCropper
        path: file.path,
        width: image.width / 3,
        height: image.height / 3,
        cropperToolbarTitle: "Crop Image",
        cropperToolbarColor: "#673ab7",
        cropperToolbarWidgetColor: "#ffffff",
        cropperStatusBarColor: "#673ab7",
        cropperActiveWidgetColor: "#673ab7",
        cropperCircleOverlay: false,
        cropping: true,
        includeBase64: true,
        enableRotationGesture: false,
        cropperChooseText: "Done",
        cropperCancelText: "Cancel",
        freeStyleCropEnabled: false,
        showCropGuidelines: false,
        showCropFrame: false,
        hideBottomControls: true,
        cropperTouchedColor: "#673ab7",
        avoidEmptySpaceAroundImage: false,
        cropperInitialFrameScale: 1.0,
        rectX: x,
        rectY: y,
      });
      files.push(croppedFile); // add the cropped file to the list
    }
    return files; // return the list of files
  }

  function swapItems(index) {
    setGridItems((prevGridItems) => {
      const temp = prevGridItems[index];
      prevGridItems[index] = prevGridItems[emptyIndex];
      prevGridItems[emptyIndex] = temp;
      return [...prevGridItems];
    });
    setEmptyIndex(index);
    if (isEqual(gridItems, originalItems)) {
      // check if the user has arranged them correctly
      alert("You won!"); // show a popup
      loadNewGame(); // reload a new game
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Puliza
      </Text>
      <FlatList // use FlatList to display grid items
        data={gridItems}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3} // set number of columns to 3
        renderItem={({ item, index }) => {
          if (index === emptyIndex) {
            return (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderWidth: 1,
                  borderColor: "#2196f3",
                }}
              />
            );
          } else {
            return (
              <TouchableOpacity
                onPress={() => {
                  if (
                    Math.abs(index - emptyIndex) === 1 ||
                    Math.abs(index - emptyIndex) === 3
                  ) {
                    swapItems(index);
                  }
                }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderWidth: 1,
                    borderColor: "#9e9e9e",
                  }}
                >
                  <Image // display the image file
                    source={{ uri: `data:${item.mime};base64,${item.data}` }}
                    style={{ width: 100, height: 100 }}
                  />
                </View>
              </TouchableOpacity>
            );
          }
        }}
      />
    </View>
  );
}
