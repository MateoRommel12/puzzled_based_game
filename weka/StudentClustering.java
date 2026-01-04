import weka.clusterers.SimpleKMeans;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;
import weka.filters.Filter;
import weka.filters.unsupervised.attribute.Remove;
import java.io.FileWriter;
import java.io.PrintWriter;

/**
 * Student Clustering using WEKA
 * 
 * Usage: java -cp "weka.jar:." StudentClustering <arff_file> <num_clusters> <output_file>
 * 
 * Example:
 *   java -cp "weka.jar:." StudentClustering students.arff 3 clusters.csv
 */
public class StudentClustering {
    public static void main(String[] args) {
        if (args.length < 3) {
            System.out.println("ERROR: Usage: java StudentClustering <arff_file> <num_clusters> <output_file>");
            System.exit(1);
        }
        
        String arffFile = args[0];
        int numClusters = Integer.parseInt(args[1]);
        String outputFile = args[2];
        
        try {
            // Load data from ARFF file
            DataSource source = new DataSource(arffFile);
            Instances data = source.getDataSet();
            
            // Remove class attribute if exists (clustering is unsupervised)
            if (data.classIndex() == -1 && data.numAttributes() > 0) {
                data.setClassIndex(data.numAttributes() - 1);
            }
            
            Remove remove = new Remove();
            remove.setAttributeIndices("last");
            remove.setInputFormat(data);
            Instances dataClusterer = Filter.useFilter(data, remove);
            
            // Build K-Means clusterer
            SimpleKMeans kmeans = new SimpleKMeans();
            kmeans.setNumClusters(numClusters);
            kmeans.setSeed(42); // For reproducibility
            kmeans.setPreserveInstancesOrder(true);
            kmeans.buildClusterer(dataClusterer);
            
            // Get cluster centroids for labeling
            Instances centroids = kmeans.getClusterCentroids();
            
            // Assign clusters and write results
            PrintWriter writer = new PrintWriter(new FileWriter(outputFile));
            writer.println("user_id,cluster_number,cluster_label");
            
            for (int i = 0; i < dataClusterer.numInstances(); i++) {
                int cluster = kmeans.clusterInstance(dataClusterer.instance(i));
                String label = getClusterLabel(cluster, numClusters, centroids.instance(cluster));
                writer.println((i+1) + "," + cluster + "," + label);
            }
            
            writer.close();
            
            // Print success message (will be captured by PHP)
            System.out.println("SUCCESS: Clustering completed");
            System.out.println("Clusters: " + numClusters);
            System.out.println("Students: " + dataClusterer.numInstances());
            
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    /**
     * Assign human-readable labels to clusters based on performance
     */
    private static String getClusterLabel(int cluster, int numClusters, weka.core.Instance centroid) {
        if (numClusters == 3) {
            // Calculate average score from centroid
            double avgScore = 0;
            int count = 0;
            for (int i = 0; i < centroid.numValues(); i++) {
                if (!centroid.isMissing(i)) {
                    avgScore += centroid.value(i);
                    count++;
                }
            }
            avgScore = count > 0 ? avgScore / count : 0;
            
            // Label based on average performance
            // Assuming first attribute is score (literacy or math)
            double firstScore = centroid.numValues() > 0 ? centroid.value(0) : avgScore;
            
            if (firstScore >= 75) {
                return "High Achievers";
            } else if (firstScore >= 50) {
                return "Average Performers";
            } else {
                return "Needs Support";
            }
        }
        
        // Default labels for other cluster numbers
        String[] labels = {"High Achievers", "Average Performers", "Needs Support", 
                           "Cluster 3", "Cluster 4", "Cluster 5"};
        return cluster < labels.length ? labels[cluster] : "Cluster " + cluster;
    }
}

