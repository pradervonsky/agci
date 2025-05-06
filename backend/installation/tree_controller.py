# backend/installation/tree_controller.py
import json
import requests
from datetime import datetime


class TreeInstallationController:
    """Controller for the physical tree art installation"""

    def __init__(self, api_url=None, installation_id=None):
        """Initialize controller with API endpoint for the installation"""
        self.api_url = api_url
        self.installation_id = installation_id

    def update_installation(self, gci_data):
        """
        Update the tree installation based on GCI data

        The tree's appearance changes based on the overall sustainability score:
        - High score (80-100): Vibrant green, full foliage
        - Medium score (50-79): Moderately green, some yellowing
        - Low score (<50): Sparse foliage, brown leaves
        """
        if not self.api_url:
            print("No API URL configured for installation")
            return False

        overall_score = gci_data["overall_score"]
        dimension_scores = gci_data["dimension_scores"]

        # Calculate tree appearance parameters
        tree_params = {
            "foliage_density": self._calculate_foliage_density(overall_score),
            "leaf_color": self._calculate_leaf_color(overall_score),
            "branch_visibility": self._calculate_branch_visibility(overall_score),
            "dimension_effects": self._calculate_dimension_effects(dimension_scores),
            "installation_id": self.installation_id,
            "timestamp": datetime.now().isoformat(),
        }

        # Add seasonal elements
        tree_params.update(self._get_seasonal_elements())

        try:
            # Send update to installation API
            response = requests.post(
                f"{self.api_url}/update",
                json=tree_params,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code == 200:
                print(f"Installation updated successfully: {response.json()}")
                return True
            else:
                print(
                    f"Failed to update installation: {response.status_code} - {response.text}"
                )
                return False

        except Exception as e:
            print(f"Error updating installation: {e}")
            return False

    def _calculate_foliage_density(self, overall_score):
        """Calculate foliage density (0-100) based on overall score"""
        # Direct mapping: higher score = more leaves
        return overall_score

    def _calculate_leaf_color(self, overall_score):
        """Calculate leaf color parameters based on overall score"""
        # Green to yellow to brown gradient
        if overall_score >= 80:
            # Vibrant green
            return {"r": 100, "g": 220, "b": 100}
        elif overall_score >= 50:
            # Yellowish green
            yellow_factor = (80 - overall_score) / 30  # 0 at score 80, 1 at score 50
            return {
                "r": int(100 + (yellow_factor * 155)),
                "g": int(220 - (yellow_factor * 70)),
                "b": int(100 - (yellow_factor * 70)),
            }
        else:
            # Brown
            brown_factor = (50 - overall_score) / 50  # 0 at score 50, 1 at score 0
            return {
                "r": int(180 - (brown_factor * 40)),
                "g": int(150 - (brown_factor * 70)),
                "b": int(30),
            }

    def _calculate_branch_visibility(self, overall_score):
        """Calculate branch visibility (0-100) based on overall score"""
        # Inverse relationship: lower score = more visible branches
        return max(0, 100 - overall_score)

    def _calculate_dimension_effects(self, dimension_scores):
        """
        Calculate special effects for each dimension

        Each dimension score can affect different aspects of the tree:
        - Air: Subtle mist/air effects around the tree
        - Water: Water droplet effects, ground moisture
        - Nature: Bird/insect presence, surrounding plants
        - Waste: Ground cleanliness, recyclable elements
        - Noise: Ambient sound level in the installation
        """
        effects = {}

        # Air quality effects
        effects["air_effects"] = {
            "mist_density": dimension_scores["air"] / 100,
            "air_particles": max(0, 100 - dimension_scores["air"]) / 100,
        }

        # Water effects
        effects["water_effects"] = {
            "droplet_frequency": dimension_scores["water"] / 100,
            "ground_moisture": dimension_scores["water"] / 100,
        }

        # Nature effects
        effects["nature_effects"] = {
            "bird_presence": dimension_scores["nature"] / 100,
            "surrounding_plants": dimension_scores["nature"] / 100,
        }

        # Waste effects
        effects["waste_effects"] = {
            "ground_cleanliness": dimension_scores["waste"] / 100,
            "recyclable_elements": dimension_scores["waste"] / 100,
        }

        # Noise effects
        effects["noise_effects"] = {
            "ambient_sound_level": max(0, 100 - dimension_scores["noise"]) / 100,
            "nature_sounds": dimension_scores["noise"] / 100,
        }

        return effects

    def _get_seasonal_elements(self):
        """Get seasonal elements based on current time of year"""
        month = datetime.now().month

        # Default (no special elements)
        seasonal = {"seasonal_type": "default", "intensity": 0.5}

        # Spring (March-May)
        if 3 <= month <= 5:
            seasonal = {"seasonal_type": "spring_bloom", "intensity": 0.8}

        # Summer (June-August)
        elif 6 <= month <= 8:
            seasonal = {"seasonal_type": "summer_fullness", "intensity": 1.0}

        # Fall (September-November)
        elif 9 <= month <= 11:
            seasonal = {"seasonal_type": "fall_colors", "intensity": 0.9}

        # Winter (December-February)
        else:
            # Special case for winter holidays
            if month == 12 and datetime.now().day >= 15:
                seasonal = {"seasonal_type": "winter_holiday", "intensity": 0.7}
            else:
                seasonal = {"seasonal_type": "winter_sparse", "intensity": 0.4}

        return {"seasonal_elements": seasonal}
