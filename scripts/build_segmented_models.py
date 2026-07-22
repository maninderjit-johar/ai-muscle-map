"""Build web-ready body meshes with selectable anatomical surface regions.

The source is a neutral base mesh, not a medical muscle model. These regions are
carefully positioned surface approximations intended for workout visualization.
"""

from pathlib import Path

import numpy as np
import trimesh


ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "public" / "models"


def ellipse(points, center, radii):
    return np.sum(((points - np.asarray(center)) / np.asarray(radii)) ** 2, axis=1) <= 1.0


def build(sex: str):
    source = trimesh.load(MODEL_DIR / f"{sex}.glb", force="scene").to_geometry()
    parts = source.split(only_watertight=False)
    body_center_x = 0.4487 if sex == "male" else -0.5017

    # The supplied GLB contains two remote eye spheres from the other figure.
    # Retain all connected parts belonging to this figure and drop those strays.
    parts = [part for part in parts if abs(part.centroid[0] - body_center_x) < 0.9]
    body = trimesh.util.concatenate(parts)
    body.apply_translation([-body_center_x, 0, 0])

    points = body.triangles_center
    x, y, z = points.T
    # Surface direction is more reliable than depth because the source pose
    # angles the arms behind the torso plane.
    front = body.face_normals[:, 2] > 0.22
    back = body.face_normals[:, 2] < -0.22

    # Region proportions are normalized to each independently centered body.
    # Masks operate on actual surface triangles, so heat follows the silhouette.
    torso = np.abs(x) < 0.37
    shoulder_cap = (np.abs(x) > 0.18) & (np.abs(x) < 0.40) & (y > 0.60) & (y < 0.76)
    upper_arm = (np.abs(x) > 0.30) & (np.abs(x) < 0.50) & (y > 0.45) & (y < 0.60)
    thigh = (np.abs(x) > 0.07) & (np.abs(x) < 0.29) & (y > -0.34) & (y < -0.04)
    lower_leg = (np.abs(x) > 0.06) & (np.abs(x) < 0.23) & (y > -0.91) & (y < -0.60)
    forearm = (np.abs(x) > 0.47) & (np.abs(x) < 0.74) & (y > 0.30) & (y < 0.44)

    masks = {
        "chest": front & torso & ~shoulder_cap & ellipse(points, [0, 0.48, 0.10], [0.34, 0.18, 0.13]),
        "shoulders": shoulder_cap,
        "biceps": front & upper_arm & ~shoulder_cap,
        "triceps": back & upper_arm & ~shoulder_cap,
        "forearms": forearm,
        "abs": front & (np.abs(x) < 0.22) & (y > 0.18) & (y < 0.39),
        "lats": back & torso & ~upper_arm & ~shoulder_cap & (np.abs(x) > 0.10) & (np.abs(x) < 0.29) & (y > 0.31) & (y < 0.57),
        "traps": back & (np.abs(x) < 0.29) & (y > 0.52) & (y < 0.73),
        "glutes": back & (
            ellipse(points, [-0.13, 0.08, -0.10], [0.14, 0.07, 0.12])
            | ellipse(points, [0.13, 0.08, -0.10], [0.14, 0.07, 0.12])
        ),
        "quads": front & thigh,
        "hamstrings": back & thigh,
        "calves": back & lower_leg,
    }

    scene = trimesh.Scene()

    for name, mask in masks.items():
        face_ids = np.flatnonzero(mask)
        if len(face_ids) == 0:
            raise RuntimeError(f"No faces selected for {sex} {name}")
        region = body.submesh([face_ids], append=True, repair=False)
        # Lift overlays just above the skin to prevent depth flicker.
        region.vertices += region.vertex_normals * 0.0035
        region.visual = trimesh.visual.ColorVisuals(region, face_colors=[255, 96, 48, 255])
        scene.add_geometry(region, geom_name=f"muscle__{name}", node_name=f"muscle__{name}")
        print(f"{sex:6} {name:11} {len(face_ids):4} faces")

    body.visual = trimesh.visual.ColorVisuals(body, face_colors=[174, 183, 180, 255])
    scene.add_geometry(body, geom_name="body_surface", node_name="body_surface")

    scene.export(MODEL_DIR / f"{sex}-segmented.glb")


for body_type in ("male", "female"):
    build(body_type)
