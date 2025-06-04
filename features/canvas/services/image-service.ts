/**
 * Service for generating Lorem Picsum images
 * Provides various options for random, specific, and styled images
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  id?: number;
  seed?: string;
  grayscale?: boolean;
  blur?: number; // 1-10
  format?: "jpg" | "webp";
}

/**
 * Generate a random Lorem Picsum image URL
 */
export const generateRandomImage = (options: ImageOptions = {}): string => {
  const {
    width = 400,
    height = 300,
    id,
    seed,
    grayscale = false,
    blur,
    format = "jpg",
  } = options;

  let url = "https://picsum.photos";

  // Add specific image ID if provided
  if (id !== undefined) {
    url += `/id/${id}`;
  }

  // Add seed for consistent random image if provided
  if (seed) {
    url += `/seed/${seed}`;
  }

  // Add dimensions
  url += `/${width}/${height}`;

  // Add format extension
  url += `.${format}`;

  // Add query parameters
  const params = new URLSearchParams();

  if (grayscale) {
    params.append("grayscale", "");
  }

  if (blur !== undefined && blur >= 1 && blur <= 10) {
    params.append("blur", blur.toString());
  }

  // Add random parameter to prevent caching for truly random images
  if (!id && !seed) {
    params.append("random", Date.now().toString());
  }

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
};

/**
 * Generate a placeholder image with specific dimensions
 */
export const generatePlaceholderImage = (
  width: number,
  height: number
): string => {
  return generateRandomImage({ width, height });
};

/**
 * Generate a themed image based on content type
 */
export const generateThemedImage = (
  theme: "nature" | "tech" | "people" | "architecture" | "abstract",
  width = 400,
  height = 300
): string => {
  // Use specific image IDs that match themes (these are actual Lorem Picsum image IDs)
  const themeIds = {
    nature: [1018, 1025, 1036, 1044, 1080, 1084],
    tech: [1, 2, 3, 4, 5, 6],
    people: [91, 177, 203, 338, 342, 399],
    architecture: [1022, 1024, 1031, 1040, 1043, 1058],
    abstract: [1041, 1045, 1047, 1050, 1052, 1055],
  };

  const ids = themeIds[theme];
  const randomId = ids[Math.floor(Math.random() * ids.length)];

  return generateRandomImage({ width, height, id: randomId });
};

/**
 * Generate multiple unique images for galleries or collections
 */
export const generateImageCollection = (
  count: number,
  options: ImageOptions = {}
): string[] => {
  const images: string[] = [];
  const { width = 400, height = 300 } = options;

  for (let i = 0; i < count; i++) {
    images.push(
      generateRandomImage({
        ...options,
        width,
        height,
        // Use timestamp + index to ensure uniqueness
        seed: `collection-${Date.now()}-${i}`,
      })
    );
  }

  return images;
};

/**
 * Get image information from Lorem Picsum API
 */
export const getImageInfo = async (id: number): Promise<any> => {
  try {
    const response = await fetch(`https://picsum.photos/id/${id}/info`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch image info:", error);
    return null;
  }
};

/**
 * Get list of available images from Lorem Picsum API
 */
export const getImageList = async (page = 1, limit = 30): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch image list:", error);
    return [];
  }
};
