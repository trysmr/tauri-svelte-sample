use serde::{Deserialize, Serialize};
use std::fs;
use tauri::command;

#[derive(Serialize, Deserialize, Clone)]
struct Node {
    id: u32,
    x: f64,
    y: f64,
    label: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Edge {
    from: u32,
    to: u32,
}

#[derive(Serialize, Deserialize, Clone)]
struct Graph {
    nodes: Vec<Node>,
    edges: Vec<Edge>,
}

#[command]
fn format_label(input: &str) -> String {
    input.trim().chars().take(20).collect()
}

#[command]
fn save_graph(path: &str, graph: Graph) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&graph).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

#[command]
fn load_graph(path: &str) -> Result<Graph, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            format_label,
            save_graph,
            load_graph
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn format_label_trims_whitespace() {
        assert_eq!("hello", format_label(" hello "));
    }

    #[test]
    fn format_label_truncates_to_20_chars() {
        let result = format_label(&"a".repeat(30));
        assert_eq!(20, result.len());
    }

    #[test]
    fn format_label_handles_empty_string() {
        assert_eq!("", format_label(""));
    }

    #[test]
    fn format_label_preserves_short_string() {
        assert_eq!("ノード1", format_label("ノード1"));
    }

    #[test]
    fn format_label_trims_then_truncates() {
        let input = format!(" {} ", "あ".repeat(25));
        assert_eq!("あ".repeat(20), format_label(&input))
    }

    #[test]
    fn save_and_load_graph_roundtrip() {
        let graph = Graph {
            nodes: vec![
                Node {
                    id: 0,
                    x: 100.0,
                    y: 200.0,
                    label: "A".to_string(),
                },
                Node {
                    id: 1,
                    x: 300.0,
                    y: 400.0,
                    label: "B".to_string(),
                },
            ],
            edges: vec![Edge { from: 0, to: 1 }],
        };

        let tmpfile = tempfile::NamedTempFile::new().unwrap();
        let path = tmpfile.path().to_str().unwrap().to_string();

        save_graph(&path, graph.clone()).unwrap();
        let loaded = load_graph(&path).unwrap();

        assert_eq!(2, loaded.nodes.len());
        assert_eq!("A", loaded.nodes[0].label);
        assert_eq!(300.0, loaded.nodes[1].x);
        assert_eq!(1, loaded.edges.len());
        assert_eq!(0, loaded.edges[0].from);
        assert_eq!(1, loaded.edges[0].to);
    }

    #[test]
    fn load_graph_returns_error_for_missing_file() {
        let result = load_graph("/tmp/nonexistent_file_12345.json");
        assert!(result.is_err());
    }

    #[test]
    fn load_graph_returns_error_for_invalid_json() {
        let mut tmpfile = tempfile::NamedTempFile::new().unwrap();
        write!(tmpfile, "not valid json").unwrap();
        let path = tmpfile.path().to_str().unwrap();

        let result = load_graph(path);
        assert!(result.is_err());
    }
}
