import marimo

__generated_with = "0.14.15"
app = marimo.App(width="columns")


@app.cell(column=0, hide_code=True)
def _(mo):
    mo.md(r"""## Declaring the input image""")
    return


@app.cell
def _(mo):
    from moimage import ImageUploadWidget

    image_input = mo.ui.anywidget(ImageUploadWidget())
    image_input
    return (image_input,)


@app.cell
def _():
    import marimo as mo
    import numpy as np
    return mo, np


@app.cell(hide_code=True)
def _():
    from pathlib import Path
    import urllib.request

    if not Path("sam_vit_h_4b8939.pth").exists():
        urllib.request.urlretrieve(
            "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth",
            "sam_vit_h_4b8939.pth",
        )
    return


@app.cell(hide_code=True)
def _():
    import torch

    # Check if CUDA is available
    cuda_available = torch.cuda.is_available()

    # Create a list to store GPU status information
    gpu_status = []

    if cuda_available:
        num_gpus = torch.cuda.device_count()

        for gpu_id in range(num_gpus):
            gpu_info = {
                "id": gpu_id,
                "name": torch.cuda.get_device_name(gpu_id),
                "memory_total": torch.cuda.get_device_properties(gpu_id).total_memory,
                "memory_allocated": torch.cuda.memory_allocated(gpu_id),
                "memory_reserved": torch.cuda.memory_reserved(gpu_id),
            }
            gpu_status.append(gpu_info)
    else:
        gpu_status.append({"error": "CUDA is not available. No GPU found."})

    gpu_status
    return


@app.cell
def _(image_input):
    image_input.value
    return


@app.cell
def _(image_input):
    from PIL import Image
    import io


    def base64_to_file(base64_str, filepath="output_image.png"):
        """Takes a base64 html src and writes it as a png file on disk."""
        import base64

        # Split the base64 string to remove the prefix
        header, encoded = base64_str.split(",", 1)

        # Decode the base64 string
        image_data = base64.b64decode(encoded)

        # Write the binary data to a file
        with open(filepath, "wb") as file:
            file.write(image_data)


    base64_to_file(image_input.src)
    image = Image.open("output_image.png")
    image = image.convert("RGB")
    # np.array(image)
    return Image, image


@app.cell
def _():
    from segment_anything import SamPredictor, sam_model_registry

    sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
    sam.to(device="cpu")
    return SamPredictor, sam


@app.cell
def _(SamPredictor, sam):
    predictor = SamPredictor(sam)
    return (predictor,)


@app.cell
def _(image, np, predictor):
    predictor.set_image(np.array(image))
    return


@app.cell
def _():
    return


@app.cell(column=1, hide_code=True)
def _(mo):
    mo.md(r"""## Annotation Widget""")
    return


@app.cell
def _(image, mo):
    from molabel import ImageLabel

    image

    label_widget = mo.ui.anywidget(
        ImageLabel(paths=["output_image.png"], classes=["foreground"], colors=["orange"])
    )
    label_widget
    return (label_widget,)


@app.cell
def _(label_widget):
    annots = label_widget.get_normalized_annotations()[0]["elements"]
    points = [a for a in annots if a["type"] == "point"]
    boxes = [a for a in annots if a["type"] == "box"]
    return annots, boxes, points


@app.cell
def _(annots):
    annots
    return


@app.cell
def _(label_widget):
    label_widget.get_normalized_annotations()
    return


@app.cell
def _(label_widget):
    from sklearn.preprocessing import LabelEncoder

    _labels = [_["label"] for _ in label_widget.annotations[0]["elements"]]
    labels = LabelEncoder().fit_transform(_labels) + 1
    labels
    return (labels,)


@app.cell
def _(boxes, points):
    point_coords = [
        [
            _["points"][0]["x"],
            _["points"][0]["y"],
        ]
        for _ in points
    ]

    box_coords = [
        [
            _["points"][0]["x"],
            _["points"][0]["y"],
            _["points"][1]["x"],
            _["points"][1]["y"],
        ] 
        for _ in boxes
    ]
    return box_coords, point_coords


@app.cell
def _(box_coords, np):
    np.array(box_coords)
    return


@app.cell
def _(labels, mo, np, point_coords, predictor):
    mo.stop(len(point_coords) == 0)

    masks, scores, logits = predictor.predict(
        point_coords=np.array(point_coords),
        point_labels=labels,
        multimask_output=False,
    )
    return (masks,)


@app.cell(column=2, hide_code=True)
def _(mo):
    mo.md(r"""## Segment-Anything results""")
    return


@app.cell
def _(box_coords, image, masks, point_coords):
    import matplotlib.pylab as plt

    plt.imshow(image)
    if len(point_coords + box_coords):
        plt.scatter(*zip(*point_coords))
        plt.imshow(masks[0], alpha=0.3)
    plt.show()
    return


@app.cell
def _(Image, image, masks, np):
    rgba_image = np.dstack([np.array(image), masks[0] * 255])

    masked_image = Image.fromarray(rgba_image.astype(np.uint8), mode='RGBA')
    masked_image
    return


if __name__ == "__main__":
    app.run()
